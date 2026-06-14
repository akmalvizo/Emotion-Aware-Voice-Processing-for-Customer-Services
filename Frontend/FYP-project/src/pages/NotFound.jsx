// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';

export default function NotFound() {
  return (
    <AppShell>
      <div className="not-found-container text-center py-20">
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-2">Page Not Found</h2>
        <p className="text-lg text-slate-600 mb-8">
          The page you are looking for doesn't exist or an error occurred.
        </p>
        <Link to="/" className="btn btn-primary">
          Go to Homepage
        </Link>
      </div>
    </AppShell>
  );
}