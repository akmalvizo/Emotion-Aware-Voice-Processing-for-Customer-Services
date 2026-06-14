// src/components/Layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const styles = {
    header: {
      backgroundColor: 'var(--color-card-bg)', 
      padding: '16px 40px',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      zIndex: 50 // Ensures header stays above Vanta
    },
    brandLink: {
      fontSize: '1.4rem',
      fontWeight: '800',
      color: 'var(--color-accent-blue)', // Pura naam Cyan color mein
      textDecoration: 'none',
      letterSpacing: '-0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoImg: {
      width: '32px', // Logo size adjusted for better visibility
      height: '32px',
      objectFit: 'contain'
    },
    navMenu: {
      display: 'flex',
      gap: '30px',
      alignItems: 'center',
    },
    unifiedLink: {
      color: 'var(--color-accent-blue)', // Sab links Cyan color mein
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.95rem',
      transition: 'opacity 0.2s ease, text-shadow 0.2s ease'
    }
  };
  
  return (
    <header style={styles.header}>
      <div>
        <Link to="/dashboard" style={styles.brandLink}>
          {/* Public folder se direct logo.svg call kiya gaya hai */}
          <img src="/logo.svg" alt="VoiceLab Logo" style={styles.logoImg} />
          <span>VoiceLab</span>
        </Link>
      </div>

      <nav style={styles.navMenu}>
        {/* Hover effect ke liye inline CSS classes ya hover styling normal transition par depend karegi */}
        <Link to="/dashboard" style={styles.unifiedLink}>Dashboard</Link>
        <Link to="/voice" style={styles.unifiedLink}>Voice Hub</Link>
        <Link to="/about" style={styles.unifiedLink}>About</Link>
      </nav>
    </header>
  );
}