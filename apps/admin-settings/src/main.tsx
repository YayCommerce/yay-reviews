import './main.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';
import AppProvider from './providers/app-provider';

createRoot(document.getElementById('yayrev-settings') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);
