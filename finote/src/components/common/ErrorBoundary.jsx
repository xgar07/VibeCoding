import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production you could send this to a logging service
    if (import.meta.env.DEV) {
      console.error('[Finote ErrorBoundary]', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#0F172A',
            color: '#E2E8F0',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
            Terjadi kesalahan
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0, maxWidth: 320 }}>
            Finote mengalami masalah yang tidak terduga. Coba muat ulang halaman.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                fontSize: '0.75rem',
                color: '#F87171',
                background: 'rgba(239,68,68,0.1)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                maxWidth: 480,
                overflow: 'auto',
                textAlign: 'left',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '0.5rem',
              padding: '0.625rem 1.5rem',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Muat Ulang
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
