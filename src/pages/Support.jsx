import React from 'react';

export default function Support() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090b0d',
        color: '#ffffff',
        padding: '60px 24px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '650px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: '36px',
            marginBottom: '12px',
          }}
        >
          Stacked Support
        </h1>

        <p
          style={{
            color: '#a1a1aa',
            lineHeight: '1.7',
          }}
        >
          Need help with Stacked? We're here to help.
        </p>

        <div
          style={{
            marginTop: '40px',
            padding: '24px',
            background: '#111418',
            borderRadius: '16px',
          }}
        >
          <h2>Contact Support</h2>

          <p
            style={{
              color: '#a1a1aa',
              lineHeight: '1.7',
            }}
          >
            For questions, technical issues, bug
            reports, or account-related support,
            contact us by email.
          </p>

          <a
            href="mailto:jguzmannn05@gmail.com"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              color: '#8cff3f',
              fontWeight: '700',
            }}
          >
            jguzmannn05@gmail.com
          </a>
        </div>

        <p
          style={{
            marginTop: '40px',
            color: '#666',
            fontSize: '13px',
          }}
        >
          © 2026 Stacked
        </p>
      </div>
    </div>
  );
}