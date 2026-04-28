'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Download, MapPin, Scan, ArrowLeft, Printer, AlertCircle } from 'lucide-react';

import Link from 'next/link';

export default function GateQRPage() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const entryUrl = `${baseUrl}/entry`;
  const exitUrl = `${baseUrl}/exit`;

  const printPage = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-white text-black p-8 print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12 print:hidden">
          <Link href="/admin" className="flex items-center gap-2 text-neutral-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button 
            onClick={printPage}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            <Printer className="w-5 h-5" />
            Print Gate Signs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Entry Gate Sign */}
          <div className="border-4 border-blue-600 rounded-[2rem] p-10 text-center flex flex-col items-center">
            <div className="bg-blue-600 text-white w-full py-4 rounded-t-xl mb-8 -mt-10 -mx-10 px-10">
              <h1 className="text-3xl font-black tracking-tight italic">SVSU ENTRY GATE</h1>
            </div>
            
            <div className="p-8 border-2 border-blue-100 rounded-[2rem] mb-8">
              <QRCodeSVG value={entryUrl} size={300} level="H" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-blue-600 font-black text-xl italic uppercase">
                <Scan className="w-6 h-6" />
                Scan to Register Entry
              </div>
              <p className="text-neutral-500 font-medium">
                Please scan this code while entering the campus. <br />
                Your entry will be logged instantly.
              </p>
            </div>
            
            <div className="mt-12 pt-8 border-t border-neutral-100 w-full text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Security Management System &bull; Powered by SVSU
            </div>
          </div>

          {/* Exit Gate Sign */}
          <div className="border-4 border-red-600 rounded-[2rem] p-10 text-center flex flex-col items-center">
            <div className="bg-red-600 text-white w-full py-4 rounded-t-xl mb-8 -mt-10 -mx-10 px-10">
              <h1 className="text-3xl font-black tracking-tight italic">SVSU EXIT GATE</h1>
            </div>
            
            <div className="p-8 border-2 border-red-100 rounded-[2rem] mb-8">
              <QRCodeSVG value={exitUrl} size={300} level="H" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600 font-black text-xl italic uppercase">
                <Scan className="w-6 h-6" />
                Scan to Confirm Exit
              </div>
              <p className="text-neutral-500 font-medium">
                Please scan this code before leaving the campus. <br />
                Active entry sessions will be closed.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-neutral-100 w-full text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Security Management System &bull; Powered by SVSU
            </div>
          </div>
        </div>

        <div className="mt-20 p-8 bg-neutral-50 border border-neutral-200 rounded-3xl print:hidden">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Instructions for Security Guards
          </h3>
          <ul className="text-sm text-neutral-600 space-y-2 list-disc pl-5">
            <li>Print these signs in A4 or A3 size for better visibility.</li>
            <li>Place the <strong>Blue</strong> sign at the Entry gate and the <strong>Red</strong> sign at the Exit gate.</li>
            <li>Students can scan these codes using any QR scanner or their phone camera.</li>
            <li>Once scanned, the dashboard will update automatically.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
