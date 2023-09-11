import React from 'react';
import { createRoot } from 'react-dom/client';
import AppEntry from './AppEntry';

const container = document.getElementById('root');

if (container) {
  container.setAttribute('data-ouia-safe', 'true');
  const root = createRoot(container);
  root.render(<AppEntry />);
}
