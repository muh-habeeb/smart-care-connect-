import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/PasswordInput';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const { isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsForgotLoading(true);
    try {
      const { default: api } = await import('../lib/api');
      await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('Reset link sent! Please check your email.');
      setIsForgotMode(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl clay-shadow border border-slate-100 smooth-enter">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SmartCareConnect</h1>
          <p className="text-slate-500 text-sm mt-3 font-medium">
            {isForgotMode ? 'Enter your email to reset password.' : 'Welcome back! Please sign in to continue.'}
          </p>
        </div>

        {!isForgotMode ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400 text-sm"
                placeholder="name@hospital.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">Password</label>
                <button 
                  type="button"
                  onClick={() => setIsForgotMode(true)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <PasswordInput 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 mt-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </Button>

            <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-6">
              Authorized personnel only. All access is logged.
            </p>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Account Email</label>
              <input 
                type="email" 
                required
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400 text-sm"
                placeholder="name@hospital.com"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 mt-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20" 
              disabled={isForgotLoading}
            >
              {isForgotLoading ? 'Sending Link...' : 'Send Reset Link'}
            </Button>

            <button 
              type="button"
              onClick={() => setIsForgotMode(false)}
              className="w-full text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
