'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
}

export default function MathCaptcha({ onVerify }: CaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isError, setIsError] = useState(false);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserInput('');
    setIsError(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    
    if (parseInt(val) === num1 + num2) {
      setIsError(false);
      onVerify(true);
    } else {
      onVerify(false);
      if (val.length >= String(num1 + num2).length) {
        setIsError(true);
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Human Verification</label>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-background border border-border rounded-2xl px-4 py-3 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <span className="text-lg font-black tracking-widest text-neutral-300 select-none italic">
            {num1} + {num2} = ?
          </span>
          <button 
            type="button"
            onClick={generateCaptcha}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500 hover:text-[color:var(--accent)]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <input
          type="number"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Ans"
          className={`w-24 bg-background border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 transition-all font-bold text-center ${
            isError ? 'border-red-500/50 ring-red-500/20' : 'border-border focus:ring-accent/40'
          }`}
        />
      </div>
      {isError && userInput.length > 0 && (
        <p className="text-[10px] text-red-500 font-bold ml-1 animate-pulse">Incorrect Answer</p>
      )}
    </div>
  );
}
