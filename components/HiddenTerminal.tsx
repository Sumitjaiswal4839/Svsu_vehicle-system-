'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, ShieldAlert, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HiddenTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['SVSU Security Terminal v2.0', 'Type command to proceed...']);
  const [spaceCount, setSpaceCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceCount(prev => {
          const next = prev + 1;
          if (next >= 5) {
            setIsOpen(true);
            return 0;
          }
          return next;
        });
        
        // Reset counter after 2 seconds of inactivity
        setTimeout(() => setSpaceCount(0), 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    
    if (cmd === 'siteadmin') {
      try {
        const res = await fetch('/api/auth/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: 'siteadmin' })
        });

        if (res.ok) {
          setHistory(prev => [...prev, '> siteadmin', 'Access Granted. Redirecting to Admin Core...']);
          
          // Dispatch event for Navbar
          window.dispatchEvent(new Event('admin-unlocked'));
          sessionStorage.setItem('admin_unlocked', 'true');

          setTimeout(() => {
            setIsOpen(false);
            router.push('/admin/dashboard');
          }, 1000);
        } else {
          setHistory(prev => [...prev, `> ${cmd}`, 'Access Denied. Signature verification failed.']);
        }
      } catch (err) {
        setHistory(prev => [...prev, `> ${cmd}`, 'Connection Error. Terminal locked.']);
      }
    } else if (cmd === 'logout') {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        setHistory(prev => [...prev, '> logout', 'Terminating Session...', 'Clearing local cache...', 'Redirecting...']);
        sessionStorage.removeItem('admin_unlocked');
        window.dispatchEvent(new Event('admin-locked'));
        
        setTimeout(() => {
          setIsOpen(false);
          window.location.href = '/login';
        }, 1500);
      } catch (err) {
        setHistory(prev => [...prev, '> logout', 'Logout failed. Force clearing...']);
        window.location.href = '/login';
      }
    } else if (cmd === 'clear') {
      setHistory([]);
    } else if (cmd === 'exit') {
      setIsOpen(false);
    }
 else {
      setHistory(prev => [...prev, `> ${cmd}`, 'Invalid command. Access Denied.']);
    }
    
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-[#0c0c0e] border border-green-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.2)]"
          >
            {/* Terminal Header */}
            <div className="bg-neutral-900 px-4 py-2 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">SVSU_SECURE_KERNEL</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm h-80 overflow-y-auto bg-black/50 custom-scrollbar">
              <div className="space-y-1">
                {history.map((line, i) => (
                  <p key={i} className={`${line.startsWith('>') ? 'text-blue-400' : line.includes('Access Granted') ? 'text-green-500' : 'text-neutral-500'}`}>
                    {line}
                  </p>
                ))}
              </div>
              
              <form onSubmit={handleCommand} className="mt-4 flex items-center gap-2">
                <span className="text-green-500">root@svsu:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder:text-neutral-800"
                  placeholder="..."
                  autoFocus
                />
              </form>
            </div>

            {/* Terminal Footer */}
            <div className="bg-black/80 px-6 py-3 flex items-center justify-between border-t border-neutral-900">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-yellow-600" />
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Auth Required</span>
                </div>
                <div className="flex items-center gap-1">
                  <Command className="w-3 h-3 text-blue-600" />
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Encrypted</span>
                </div>
              </div>
              <p className="text-[8px] text-neutral-700 uppercase tracking-tighter">Enter 'siteadmin' to override</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
