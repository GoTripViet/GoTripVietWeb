// mfe-auth/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Chỉ mount khi chạy lẻ (dev)
const el = document.getElementById('auth-dev-root');
if (process.env.NODE_ENV === 'development' && el) {
  const { BrowserRouter } = require('react-router-dom');
  createRoot(el).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

// Container sẽ import('auth/App') từ exposes -> export mặc định
export default App;
