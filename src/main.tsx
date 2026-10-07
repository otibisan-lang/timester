import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  document.body.innerHTML =
    '<p style="padding:1rem;font-family:sans-serif">CHARASTER: #root が見つかりません。index.html をブラウザで開き直すか、<code>npm run dev</code> / <code>npm run preview</code> で表示してください。</p>';
}
