import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@nexus.com');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. Try admin@nexus.com');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="w-full max-w-[350px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">NexusLMS</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email to sign in to your account</p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <Input 
                id="email"
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
              <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                Sign In with Email
              </Button>
            </div>
          </form>

          {error && (
            <div className="text-sm text-red-500 text-center font-medium">
              {error}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 dark:bg-gray-950 px-2 text-gray-500">Demo Accounts</span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
             <button type="button" onClick={() => setEmail('admin@nexus.com')} className="block w-full hover:text-gray-900 dark:hover:text-white transition-colors">Admin: admin@nexus.com</button>
             <button type="button" onClick={() => setEmail('instructor@nexus.com')} className="block w-full hover:text-gray-900 dark:hover:text-white transition-colors">Instructor: instructor@nexus.com</button>
             <button type="button" onClick={() => setEmail('alice@nexus.com')} className="block w-full hover:text-gray-900 dark:hover:text-white transition-colors">Student: alice@nexus.com</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;