import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './lib/AuthContext'

// Optimize initial rendering by using a requestIdleCallback
// This helps browsers prioritize critical rendering tasks
const startApp = () => {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

// Use requestIdleCallback for non-critical initialization
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    startApp();
  });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(startApp, 1);
}
