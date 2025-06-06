import './main.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

import 'react-quill/dist/quill.snow.css';

createRoot(document.getElementById('yay-reviews-settings') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
