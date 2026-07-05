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
          className: 'dark:bg-content1 dark:text-foreground',
          duration: 4000,
          style: {
            background: 'var(--heroui-content1)',
            color: 'var(--heroui-foreground)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
