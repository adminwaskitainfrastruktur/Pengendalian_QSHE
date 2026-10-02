import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { msalInstance } from './components/Auth'; // <-- Ini perbaikannya
import './index.css';

async function init() {
  try {
    await msalInstance.initialize();
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Gagal menginisialisasi MSAL:', error);
    document.getElementById('root')!.innerHTML = `
      <div style="display:flex;height:100dvh;align-items:center;justify-content:center;font-family:sans-serif;color:#ef4444;flex-direction:column;gap:12px;">
        <h2>⚠️ Gagal Memulai Aplikasi</h2>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `;
  }
}

init();