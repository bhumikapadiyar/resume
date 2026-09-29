import React from 'react';
import Analyzer from './Analyzer.jsx';
import Results from './Results.jsx';
import './Dashboard.css';

export default function Dashboard({ user, setUser, activeTab, setActiveTab, resume, setResume, job, setJob, file, setFile, analysis, loading, error, setError, analyze }) {
  const signOut = () => {
    localStorage.removeItem('resumely_user');
    localStorage.removeItem('resumely_analysis');
    setUser(null);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark">R</span> resumely
          </div>
          <nav>
            <button
              type="button"
              className={activeTab === 'analyze' ? 'nav-active' : ''}
              onClick={() => setActiveTab('analyze')}
            >
              <span>✦</span> Analyze resume
            </button>
            <button
              type="button"
              className={activeTab === 'results' ? 'nav-active' : ''}
              onClick={() => setActiveTab('results')}
            >
              <span>◒</span> Latest results
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="mini-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
          <button className="logout" onClick={signOut} title="Sign out" type="button">
            ↗
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="status-dot"></span> Workspace / {activeTab === 'analyze' ? 'New analysis' : 'Latest report'}
          </div>
          <span className="plan-pill">FREE PLAN</span>
        </header>

        <div className="workspace-body">
          {activeTab === 'analyze' ? (
            <Analyzer {...{ resume, setResume, job, setJob, file, setFile, analyze, loading, error, setError }} />
          ) : (
            <Results {...{ analysis, setActiveTab }} />
          )}
        </div>
      </section>
    </main>
  );
}

