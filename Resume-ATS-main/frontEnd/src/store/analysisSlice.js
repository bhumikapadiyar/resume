import { createSlice } from '@reduxjs/toolkit';

function getStoredAnalysis() {
  try { return JSON.parse(localStorage.getItem('resumely_analysis') || 'null'); }
  catch { return null; }
}

const analysisSlice = createSlice({
  name: 'analysis',
  initialState: { result: getStoredAnalysis(), status: 'idle', error: '' },
  reducers: {
    analysisStarted: state => { state.status = 'loading'; state.error = ''; },
    analysisSucceeded: (state, action) => {
      state.result = action.payload.analysis;
      state.status = 'succeeded';
      try { localStorage.setItem('resumely_analysis', JSON.stringify(action.payload.analysis)); } catch {}
    },
    analysisFailed: (state, action) => { state.status = 'failed'; state.error = action.payload; },
    analysisCleared: state => {
      state.result = null;
      state.status = 'idle';
      state.error = '';
      try { localStorage.removeItem('resumely_analysis'); } catch {}
    }
  }
});

export const { analysisStarted, analysisSucceeded, analysisFailed, analysisCleared } = analysisSlice.actions;
export default analysisSlice.reducer;
