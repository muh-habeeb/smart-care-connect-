import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = ({ value, onChange, placeholder, required = false, className = "" }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative group">
      <input
        type={show ? "text" : "password"}
        required={required}
        value={value}
        onChange={onChange}
        className={`w-full h-12 px-4 pr-12 rounded-xl border border-slate-700/50 bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-600 transition-all text-sm ${className}`}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};
