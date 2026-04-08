import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Loader2, Eye, EyeOff, ArrowRight, Phone, MapPin, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  'Finanzas', 'Negocios', 'Datos & IA', 'Legal',
  'Marketing', 'Tecnología', 'Recursos Humanos', 'Startups'
];

// ─── LOGIN ───────────────────────────────────────────────
const LoginForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('profiles').select('role').eq('email', email).single();
    navigate(data?.role === 'asesor' ? '/dashboard/asesor' : '/dashboard/cliente');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* FORMULARIO IZQUIERDA */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-8 py-10 lg:px-16">
        <Link to="/" className="flex items-center gap-2.5 w-fit">
          <img src="/favicon.png" alt="Axioma" className="w-9 h-9 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.3))' }} />
          <div>
            <p className="font-black tracking-tighter uppercase text-base leading-none text-[#0A0E27]">AXIOMA</p>
            <p className="text-[#10B981] text-[7px] font-bold tracking-[0.4em] uppercase mt-0.5">VENTURES INTELLIGENCE</p>
          </div>
        </Link>

        <div className="max-w-sm w-full mx-auto">
          {/* TABS */}
          <div className="flex gap-6 mb-8 border-b border-gray-100 w-full">
            <button className="pb-3 text-sm font-bold text-[#0A0E27] relative">
              Sign in
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
            </button>
            <button onClick={onSwitch} className="pb-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
              Create account
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0A0E27] mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                <button type="button" className="text-xs text-[#10B981] font-medium hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#0A0E27] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#0A0E27]/90 transition-all disabled:opacity-50 mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Google', icon: <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
              { name: 'Microsoft', icon: <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg> },
              { name: 'Apple', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
            ].map((provider) => (
              <button key={provider.name}
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-xs text-gray-600 font-medium">
                {provider.icon}
                {provider.name}
              </button>
            ))}
          </div>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <button onClick={onSwitch} className="text-[#10B981] font-semibold hover:underline">Sign up</button>
          </p>
        </div>

        <p className="text-gray-300 text-xs text-center">© 2026 Axioma Ventures Intelligence C.A.</p>
      </div>

      {/* PANEL DERECHO */}
      <div className="hidden lg:flex w-1/2 bg-[#0A0E27] flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(16,185,129,0.12), transparent 60%)' }} />
        <div className="relative z-10 max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-8">
            <img src="/favicon.png" alt="Axioma" className="w-10 h-10 object-contain" style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.5))' }} />
          </div>
          <h2 className="text-3xl font-light text-white leading-tight mb-4">
            Connect with the <span className="text-[#10B981] font-normal">best advisors</span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10">
            Access your dashboard and manage your sessions with verified professionals.
          </p>
          <div className="space-y-3 text-left">
            {['Access your personalized dashboard', 'Chat with your advisors', 'Manage your sessions and payments'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={11} className="text-[#10B981]" />
                </div>
                <span className="text-white/60 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── REGISTER ────────────────────────────────────────────
const RegisterForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [role, setRole] = useState<'cliente' | 'asesor'>('cliente');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Campos comunes
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Campos solo asesor
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }
    const { error } = await signUp(email, password, name, role);
    if (error) {
      setError(error.message || 'Error al crear la cuenta.');
      setLoading(false);
      return;
    }

    // Si es asesor, guardar datos adicionales
    if (role === 'asesor') {
      const { data: profileData } = await supabase.from('profiles').select('id').eq('email', email).single();
      if (profileData) {
        await supabase.from('profiles').update({ phone, country }).eq('id', profileData.id);
        await supabase.from('advisors').insert({
          user_id: profileData.id,
          title,
          category,
          experience,
          bio,
          available: true,
          verified: false,
        });
      }
    }

    await fetch('https://bcwsygdipoyrhonzqyvg.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_CL_mM0jG6uwrxRt2_IeRnA_uoButs_y' },
      body: JSON.stringify({ type: 'registro', to: email, name, role }),
    });

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-[#10B981]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account created!</h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation to <span className="font-medium text-gray-800">{email}</span>. Check your inbox to activate your account.
          </p>
          <button onClick={onSwitch}
            className="bg-[#0A0E27] text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-[#0A0E27]/90 transition-all">
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg flex flex-col items-center">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <img src="/favicon.png" alt="Axioma" className="w-9 h-9 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.3))' }} />
          <div>
            <p className="font-black tracking-tighter uppercase text-base leading-none text-[#0A0E27]">AXIOMA</p>
            <p className="text-[#10B981] text-[7px] font-bold tracking-[0.4em] uppercase mt-0.5">VENTURES INTELLIGENCE</p>
          </div>
        </Link>

        {/* TABS */}
        <div className="flex gap-6 mb-8 border-b border-gray-100 w-full">
          <button onClick={onSwitch} className="pb-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
            Sign in
          </button>
          <button className="pb-3 text-sm font-bold text-[#0A0E27] relative">
            Create account
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
          </button>
        </div>

        <div className="mb-6 w-full">
          <h1 className="text-2xl font-bold text-[#0A0E27] mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm">Join Axioma and connect with top advisors</p>
        </div>

        {/* ROLE SELECTOR */}
        <div className="flex gap-3 mb-6 w-full">
          <button type="button" onClick={() => setRole('cliente')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
              role === 'cliente' ? 'border-[#10B981] bg-[#10B981]/5 text-[#10B981]' : 'border-gray-200 text-gray-400 hover:border-gray-300'
            }`}>
            <User size={15} /> Client
          </button>
          <button type="button" onClick={() => setRole('asesor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
              role === 'asesor' ? 'border-[#10B981] bg-[#10B981]/5 text-[#10B981]' : 'border-gray-200 text-gray-400 hover:border-gray-300'
            }`}>
            <Briefcase size={15} /> Advisor
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 w-full">

          {/* CAMPOS COMUNES */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50" />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50" />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* CAMPOS ADICIONALES ASESOR */}
          {role === 'asesor' && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-[#10B981] uppercase tracking-widest">Professional information</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Professional title</label>
                  <div className="relative">
                    <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CFO Independiente"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Specialty</label>
                  <select required value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50">
                    <option value="">Select specialty</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+58 424 0000000"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Country</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Venezuela, Colombia..."
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Years of experience</label>
                  <div className="relative">
                    <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 10 años de experiencia"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Professional bio</label>
                  <textarea required value={bio} onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your experience, specialties and what you offer clients..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50 resize-none" />
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-400 text-xs leading-relaxed">
            By signing up you agree to our{' '}
            <a href="#" className="text-[#10B981] hover:underline">Terms of service</a>{' '}and{' '}
            <a href="#" className="text-[#10B981] hover:underline">Privacy policy</a>
          </p>

          <button type="submit" disabled={loading}
            className="w-full bg-[#0A0E27] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#0A0E27]/90 transition-all disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create account <ArrowRight size={15} /></>}
          </button>

          {/* SOCIAL — solo para clientes */}
          {role === 'cliente' && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-400 text-xs">or sign up with</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Google', icon: <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                  { name: 'Microsoft', icon: <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg> },
                  { name: 'Apple', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
                ].map((provider) => (
                  <button key={provider.name} type="button"
                    className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-xs text-gray-600 font-medium">
                    {provider.icon} {provider.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-[#10B981] font-semibold hover:underline">Sign in</button>
        </p>

        <p className="text-center text-gray-300 text-xs mt-8">© 2026 Axioma Ventures Intelligence C.A.</p>
      </div>
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────
const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' || window.location.pathname === '/registro' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode as any);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);

  const switchMode = (newMode: 'login' | 'register') => {
    if (animating || newMode === mode) return;
    setAnimating(true);
    setVisible(false);
    setTimeout(() => {
      setMode(newMode);
      setVisible(true);
      setTimeout(() => setAnimating(false), 400);
    }, 300);
  };

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.99)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {mode === 'login'
        ? <LoginForm onSwitch={() => switchMode('register')} />
        : <RegisterForm onSwitch={() => switchMode('login')} />
      }
    </div>
  );
};

export default AuthPage;
