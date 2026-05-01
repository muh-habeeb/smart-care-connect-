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
        className={`w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400 transition-all text-sm ${className}`}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};
