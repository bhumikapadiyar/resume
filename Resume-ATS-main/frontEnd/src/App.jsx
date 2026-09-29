import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthScreen from './components/AuthScreen.jsx';
import Dashboard from './components/Dashboard.jsx';
import { analyzeResume, authenticate } from './services/api.js';
import { setSession, clearSession } from './store/authSlice.js';
import { analysisStarted, analysisSucceeded, analysisFailed } from './store/analysisSlice.js';

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const analysisState = useSelector(state => state.analysis);
  const [authMode, setAuthMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resume, setResume] = useState('');
  const [job, setJob] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analyze');

  async function handleAuthentication(event) {
    event.preventDefault();
    setError('');
    try {
      const data = await authenticate(authMode, { name, email, password });
      const session = { ...data.user, token: data.token };
      dispatch(setSession(session));
    } catch (requestError) { setError(requestError.message); }
  }

  async function handleAnalysis() {
    if (!resume.trim() && !file) return setError('Paste your resume or upload a file to begin.');
    setLoading(true);
    dispatch(analysisStarted());
    setError('');
    try {
      const data = await analyzeResume(user.token, resume, job, file);
      dispatch(analysisSucceeded(data));
      setActiveTab('results');
    } catch (requestError) {
      if (requestError.status === 401) {
        dispatch(clearSession());
      }
      dispatch(analysisFailed(requestError.message));
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <AuthScreen
        {...{
          authMode,
          setAuthMode,
          name,
          setName,
          email,
          setEmail,
          password,
          setPassword,
          authenticate: handleAuthentication,
          error,
          setError
        }}
      />
    );
  }

  return (
    <Dashboard
      {...{
        user,
        setUser: () => dispatch(clearSession()),
        activeTab,
        setActiveTab,
        resume,
        setResume,
        job,
        setJob,
        file,
        setFile,
        analysis: analysisState.result,
        loading,
        error,
        setError,
        analyze: handleAnalysis
      }}
    />
  );
}
