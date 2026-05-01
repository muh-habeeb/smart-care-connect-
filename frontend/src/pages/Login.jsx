import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { Button } from '../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const { isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast.success('Logged in successfully!');
      if (user.role === 'Manager') navigate('/manager');
      else if (user.role === 'Junior Doctor' || user.role === 'Senior Doctor') navigate('/doctor');
      else if (user.role === 'Delivery Person') navigate('/delivery');
    } catch (err) {
      toast.error(err.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-700/50 smooth-enter">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SmartCareConnect</h1>
          <p className="text-slate-300 text-sm mt-3">Welcome back! Please sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-700/50 bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-600 transition-all text-sm"
              placeholder="name@hospital.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-700/50 bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-600 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-12 mt-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </Button>

          <p className="text-center text-slate-500 text-xs mt-6">
            Authorized personnel only. All access is logged.
          </p>
        </form>
      </div>
    </div>
  );
}
