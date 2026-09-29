import React, { useState } from 'react';
import { SAMPLES } from '../constants/samples.js';
import './Analyzer.css';

export default function Analyzer({
  resume,
  setResume,
  job,
  setJob,
  file,
  setFile,
  analyze,
  loading,
  error,
  setError
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  const loadPreset = key => {
    const sample = SAMPLES[key];
    if (!sample) return;
    setFile(null);
    setResume(sample.resume);
    setJob(sample.job);
    setActivePreset(key);
    setError('');
  };

  const clearInputs = () => {
    setFile(null);
    setResume('');
    setJob('');
    setActivePreset(null);
    setError('');
  };

  const resumeWords = resume.trim() ? resume.trim().split(/\s+/).length : 0;
  const resumeChars = resume.length;
  const jobWords = job.trim() ? job.trim().split(/\s+/).length : 0;

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <p className="eyebrow">RESUME INTELLIGENCE</p>
          <h1>
            Make your resume<br />
            <em>impossible to miss.</em>
          </h1>
          <p className="intro-copy">
            Upload your resume and a target job description. Resumely finds the signals that move applications forward.
          </p>
        </div>
        <div className="step-count">
          <strong>01</strong>
          <span>/ 02</span>
          <small>INPUT DETAILS</small>
        </div>
      </div>

      {/* Quick Interactive Demo Presets */}
      <div className="preset-bar">
        <span className="preset-label">⚡ QUICK PRESETS:</span>
        <div className="preset-chips">
          <button
            type="button"
            className={`preset-chip ${activePreset === 'strong' ? 'chip-active' : ''}`}
            onClick={() => loadPreset('strong')}
          >
            ✨ Senior Full Stack (95%+ Match)
          </button>
          <button
            type="button"
            className={`preset-chip chip-weak ${activePreset === 'weak' ? 'chip-active' : ''}`}
            onClick={() => loadPreset('weak')}
          >
            ⚠️ Entry-Level Non-Tech (Low Match)
          </button>
          {(resume || job || file) && (
            <button type="button" className="preset-chip chip-clear" onClick={clearInputs}>
              ✕ Clear Form
            </button>
          )}
        </div>
      </div>

      <div className="input-grid">
        <section className="input-card">
          <div className="card-top">
            <div>
              <span className="card-index">01</span>
              <h2>Your resume</h2>
            </div>
            <span className="required">REQUIRED</span>
          </div>

          <label
            className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFile = e.dataTransfer?.files?.[0];
              if (droppedFile) {
                setFile(droppedFile);
                setError('');
              }
            }}
          >
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={event => {
                const selected = event.target.files?.[0];
                if (selected) {
                  setFile(selected);
                  setError('');
                }
              }}
            />
            <span className="upload-icon">↑</span>
            <strong>{file ? file.name : 'Drop your resume here'}</strong>
            <small>PDF, DOCX or TXT · max 5MB</small>
            <span className="browse-button">Browse files</span>
            {file && (
              <button
                type="button"
                className="clear-file-button"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  setFile(null);
                }}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  marginTop: '10px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                ✕ Remove file
              </button>
            )}
          </label>

          <div className="or">
            <span>or paste text</span>
          </div>

          <textarea
            value={resume}
            onChange={event => {
              setResume(event.target.value);
              setActivePreset(null);
            }}
            placeholder="Paste the full text of your resume here..."
          />

          {/* Interactive Live Metrics */}
          <div className="input-meta-bar">
            <span>
              {file ? (
                <strong className="text-success">📎 File ready: {file.name}</strong>
              ) : resumeChars > 0 ? (
                `${resumeChars.toLocaleString()} chars · ${resumeWords} words`
              ) : (
                'Paste text or drop a file'
              )}
            </span>
            {resumeChars > 0 && (
              <span className={resumeChars >= 80 ? 'badge-ok' : 'badge-warn'}>
                {resumeChars >= 80 ? '✓ Ready for scan' : '⚠ Too short (<80 chars)'}
              </span>
            )}
          </div>
        </section>

        <section className="input-card target-card">
          <div className="card-top">
            <div>
              <span className="card-index">02</span>
              <h2>Target role</h2>
            </div>
            <span className="optional">OPTIONAL</span>
          </div>
          <p className="field-hint">Add a job description to get a tailored keyword match.</p>
          <textarea
            className="job-text"
            value={job}
            onChange={event => {
              setJob(event.target.value);
              setActivePreset(null);
            }}
            placeholder="Paste a job description here..."
          />

          {/* Interactive Live Metrics */}
          <div className="input-meta-bar">
            <span>{job.length > 0 ? `${job.length.toLocaleString()} chars · ${jobWords} words` : 'No JD specified'}</span>
            <span className={job.length > 0 ? 'badge-ok' : 'badge-neutral'}>
              {job.length > 0 ? '🎯 Target linked' : 'ℹ General scan'}
            </span>
          </div>

          <div className="tip">
            <span>✦</span>
            <p>
              <strong>Pro tip</strong> A specific job description unlocks your most accurate ATS score.
            </p>
          </div>
        </section>
      </div>

      {error && <div className="error form-error">{error}</div>}

      {/* Interactive Scanning Progress Overlay */}
      {loading && (
        <div className="scanning-banner">
          <div className="scanning-radar"></div>
          <div>
            <strong>AI Scanning in progress...</strong>
            <p>Evaluating keywords, section hierarchy, and semantic ATS alignment with Gemini 3.6 Flash.</p>
          </div>
        </div>
      )}

      <div className="analyze-row">
        <span>
          Powered by Gemini intelligence <i>✦</i>
        </span>
        <button className="analyze-button" onClick={analyze} disabled={loading} type="button">
          {loading ? 'Analyzing...' : 'Analyze my resume'} <span>→</span>
        </button>
      </div>
    </div>
  );
}
