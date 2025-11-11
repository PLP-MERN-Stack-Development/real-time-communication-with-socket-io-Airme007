import { useState } from 'react';
import { Card, CardContent} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5002';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Auth success, token:', data.token, 'username:', data.username);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        onAuthSuccess(data.username);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-balance mb-8">Welcome to Airme Chat</h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Register'}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input required value={username} onChange={e => setUsername(e.target.value)} className="border p-2 rounded-lg" placeholder="Username" />
          <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="border p-2 rounded-lg" placeholder="Password" />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button disabled={loading} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">{isLogin ? 'Register' : 'Login'}</button>
        </p>
      </div>
    </div>
  );
}
