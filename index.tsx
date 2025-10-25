import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastProvider } from './toast';
import { BookProvider } from './contexts/BookContext';
import { UserProvider } from './contexts/UserContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <UserProvider>
        <BookProvider>
          <App />
        </BookProvider>
      </UserProvider>
    </ToastProvider>
  </React.StrictMode>
);