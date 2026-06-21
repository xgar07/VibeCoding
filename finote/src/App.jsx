import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './router/ProtectedRoute'
import AppLayout from './components/common/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Income from './pages/Income'
import Expenses from './pages/Expenses'
import Savings from './pages/Savings'
import Memos from './pages/Memos'
import Statistics from './pages/Statistics'
import Achievements from './pages/Achievements'

const ProtectedPage = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
)

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
            <Route path="/income" element={<ProtectedPage><Income /></ProtectedPage>} />
            <Route path="/expenses" element={<ProtectedPage><Expenses /></ProtectedPage>} />
            <Route path="/savings" element={<ProtectedPage><Savings /></ProtectedPage>} />
            <Route path="/memos" element={<ProtectedPage><Memos /></ProtectedPage>} />
            <Route path="/statistics" element={<ProtectedPage><Statistics /></ProtectedPage>} />
            <Route path="/achievements" element={<ProtectedPage><Achievements /></ProtectedPage>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Inter, system-ui, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: 'transparent' }, duration: 2500 },
            error: { iconTheme: { primary: '#EF4444', secondary: 'transparent' }, duration: 4000 },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
