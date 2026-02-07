import React, { useState } from 'react';
import { ShieldCheck, X, Loader2, Mail, Lock } from 'lucide-react';
import GlassCard from './GlassCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Dentro de tu función handleSubmit en AuthModal.tsx:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

  try {
    // Apuntamos al puerto 5000 donde corre el backend
    const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      if (isLogin) {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        setIsLogin(true);
        setError('¡Cuenta creada! Ahora inicia sesión.');
      }
    } else {
      setError('Credenciales incorrectas o usuario ya existe');
    }
  } catch (err) {
    setError('Error: El backend no responde. Verifica la terminal.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0A0E27]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[440px]">
        <GlassCard className="p-8 border-[#10B981]/20">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#9198A5] hover:text-white"><X size={20} /></button>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#10B981]/10 text-[#10B981] mb-4">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-xl font-bold text-white uppercase">{isLogin ? 'Acceso Portal' : 'Registro'}</h2>
          </div>
          <div className="flex bg-[#0A0E27]/50 p-1 rounded-xl mb-8 border border-white/5">
            <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${isLogin ? 'bg-[#10B981] text-[#051A3F]' : 'text-[#9198A5]'}`}>Login</button>
            <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${!isLogin ? 'bg-[#10B981] text-[#051A3F]' : 'text-[#9198A5]'}`}>Registro</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className={`text-[10px] font-bold text-center uppercase ${error.includes('exitoso') ? 'text-[#10B981]' : 'text-red-500'}`}>{error}</div>}
            <div className="space-y-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0A0E27] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#10B981] outline-none" placeholder="Email" />
            </div>
            <div className="space-y-2">
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0A0E27] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#10B981] outline-none" placeholder="Contraseña" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#10B981] text-[#051A3F] font-black py-4 rounded-xl uppercase tracking-widest text-[10px]">
              {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (isLogin ? 'Entrar' : 'Registrarme')}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default AuthModal;