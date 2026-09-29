import { createSlice } from '@reduxjs/toolkit';

function getStoredSession() {
  try { return JSON.parse(localStorage.getItem('resumely_user') || 'null'); }
  catch { return null; }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: getStoredSession() },
  reducers: {
    setSession: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('resumely_user', JSON.stringify(action.payload));
    },
    clearSession: state => {
      state.user = null;
      localStorage.removeItem('resumely_user');
    }
  }
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
