import React, { useState } from 'react';
import { Lock, Wallet } from 'lucide-react';
import { usePinLock } from '../context/PinLockContext';

export const PinLockScreen: React.FC = () => {
  const { unlock } = usePinLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    setPin(digitsOnly);
    setError(false);

    if (digitsOnly.length === 4) {
      const ok = unlock(digitsOnly);
      if (!ok) {
        setError(true);
        setTimeout(() => setPin(''), 400);
      }
    }
  };

  return (
    <div className="h-screen h-dvh w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow Orbs (matches the main app shell) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[20%] w-[35%] h-[35%] bg-emerald-600/10 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm bg-slate-900/80 border border-white/15 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-500 via-indigo-500 to-emerald-400 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center mb-4">
          <Wallet className="w-7 h-7 text-slate-950 stroke-[2.5]" />
        </div>
        <h1 className="text-lg font-bold text-white">Home Finance</h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Digite o PIN de 4 dígitos para continuar
        </p>

        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus
          maxLength={4}
          value={pin}
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full text-center text-3xl tracking-[0.75em] font-bold py-3 pl-[0.75em] rounded-xl bg-white/5 border text-white focus:outline-hidden transition-colors ${
            error ? 'border-rose-500' : 'border-white/10 focus:border-blue-500'
          }`}
          placeholder="••••"
        />

        {error && (
          <p className="text-xs text-rose-400 font-medium mt-3 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            PIN incorreto. Tente novamente.
          </p>
        )}
      </div>
    </div>
  );
};
