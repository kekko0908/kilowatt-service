import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { apiService } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupNotice, setSignupNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await apiService.signInWithEmail(email, password);
      } else {
        result = await apiService.signUpWithEmail(email, password, name);
      }

      if (result.error) {
        setError(result.error);
      } else if (result.requiresConfirmation) {
        setSignupNotice(true);
        setIsLogin(true);
        setPassword('');
      } else if (result.user) {
        onLoginSuccess(result.user);
        onClose();
      }
    } catch (err) {
      setError('Si e verificato un errore imprevisto.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      const { error } = await apiService.loginWithGoogle();
      if (error) setError(error);
      // If no error, redirect happens automatically
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-dark border border-gray-800 rounded-2xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(163,230,53,0.1)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-display font-black italic text-white mb-2">
          {signupNotice ? 'CONFERMA EMAIL' : isLogin ? 'ACCEDI' : 'REGISTRATI'}
        </h2>
        <p className="text-gray-400 mb-6 text-sm">
          {signupNotice
            ? 'Ti abbiamo inviato un link di conferma. Apri la tua email e clicca sul link per attivare l’account.'
            : isLogin
              ? 'Benvenuto nell\'area partner Kilowatt.'
              : 'Crea il tuo account per iniziare.'}
        </p>

        {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded text-red-200 text-xs">
                {error}
            </div>
        )}

        {signupNotice ? (
          <div className="space-y-4">
            <div className="border border-neon/40 bg-neon/10 rounded-xl p-4 text-sm text-neon">
              Se non trovi l’email, controlla spam o posta indesiderata.
            </div>
            <button
              onClick={onClose}
              className="w-full bg-neon text-black font-bold uppercase py-3 rounded hover:bg-white transition-colors"
            >
              Ho capito
            </button>
            <button
              onClick={() => {
                setSignupNotice(false);
                setIsLogin(true);
              }}
              className="w-full border border-gray-700 text-gray-200 py-3 font-bold uppercase tracking-widest hover:border-neon hover:text-neon transition-colors text-xs"
            >
              Vai al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded p-3 pl-10 text-white focus:border-neon outline-none"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded p-3 pl-10 text-white focus:border-neon outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded p-3 pl-10 text-white focus:border-neon outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon text-black font-bold uppercase py-3 rounded hover:bg-white transition-colors mt-4"
            >
              {loading ? 'Elaborazione...' : (isLogin ? 'Accedi' : 'Crea Account')}
            </button>
          </form>
        )}

        {!signupNotice && (
          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-gray-800 flex-1" />
            <span className="text-gray-500 text-xs uppercase">Oppure</span>
            <div className="h-px bg-gray-800 flex-1" />
          </div>
        )}

        {!signupNotice && (
          <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black font-bold uppercase py-3 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
          </button>
        )}

        {!signupNotice && (
          <div className="mt-6 text-center">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-400 text-sm hover:text-neon underline decoration-neon underline-offset-4"
            >
                {isLogin ? 'Non hai un account? Registrati' : 'Hai gia un account? Accedi'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
