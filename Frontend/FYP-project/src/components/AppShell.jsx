// src/components/AppShell.jsx
import React from 'react';
import Header from './Layout/Header';
import Footer from './Layout/Footer';

/**
 * Main application layout wrapper.
 * Includes Header, Footer, and a main content area.
 */
export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Header />
      
      <main className="app-main-content">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}