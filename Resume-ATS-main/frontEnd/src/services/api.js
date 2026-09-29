const API_BASE = (typeof window !== 'undefined' && window.location.port === '3000')
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : '';

async function request(path, options = {}) {
  let response;
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(`Unable to reach the server at ${url}. Please check that the server is running on port 4000.`);
  }

  const contentType = response.headers.get('content-type') || '';
  let data = {};
  if (response.status !== 204) {
    if (contentType.includes('application/json')) {
      try { data = await response.json(); } catch { data = {}; }
    } else {
      const message = await response.text();
      data = message ? { error: message } : {};
    }
  }
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export function authenticate(mode, credentials) {
  return request(`/api/auth/${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
}

export function analyzeResume(token, resume, jobDescription, file) {
  const body = new FormData();
  body.append('text', resume);
  body.append('jobDescription', jobDescription);
  if (file) body.append('resume', file);
  return request('/api/analyze', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body });
}
