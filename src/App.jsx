import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './routes';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3800,
          className: 'scandi-toast',
          style: {
            background: 'var(--card, #FFFFFF)',
            color: 'var(--foreground, #202720)',
            border: '1px solid var(--border, #DDE1D8)',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            fontSize: '13.5px',
            fontWeight: '600',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#526B52',
              secondary: '#FFFFFF',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#DC2626',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
