import React from 'react';
import './AuthScreen.css';

export default function AuthScreen({ authMode, setAuthMode, name, setName, email, setEmail, password, setPassword, authenticate, error, setError }) {
  const signup = authMode === 'signup';

  const toggleAuthMode = () => {
    if (setError) setError('');
    setAuthMode(signup ? 'login' : 'signup');
  };

  return (
    <main className="auth-shell">
      <section className="auth-art">
        <div className="brand"><span className="brand-mark">R</span> resumely</div>
        <div className="art-copy">
          <p className="eyebrow">CAREER CLARITY, EDITED</p>
          <h1>Your next role starts with a sharper story.</h1>
          <p>Turn a good resume into a confident application with intelligent, practical feedback.</p>
        </div>
        <div className="art-note">
          <span>01</span>
          <div>
            <strong>Signal over noise</strong>
            <small>See what recruiters and ATS systems notice first.</small>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-inner">
          <div className="mobile-brand brand"><span className="brand-mark">R</span> resumely</div>
          <div className="auth-heading">
            <p className="eyebrow">WELCOME IN</p>
            <h2>{signup ? 'Build your edge.' : 'Welcome back.'}</h2>
            <p>{signup ? 'Start with a free resume signal check.' : 'Pick up where you left off.'}</p>
          </div>

          <form onSubmit={authenticate}>
            {signup && (
              <label>
                Full name
                <input
                  type="text"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="name@domain.com"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength="8"
                autoComplete={signup ? 'new-password' : 'current-password'}
                required
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button className="primary-button" type="submit">
              {signup ? 'Create my workspace' : 'Sign in'} <span>→</span>
            </button>
          </form>

          <p className="switch-auth">
            {signup ? 'Already have an account?' : 'New to Resumely?'}{' '}
            <button type="button" onClick={toggleAuthMode}>
              {signup ? 'Sign in' : 'Create account'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
