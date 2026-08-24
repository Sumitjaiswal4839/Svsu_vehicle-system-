'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-neutral-500 text-sm mb-6">Please try again, or go back to home.</p>
      <button onClick={reset} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Try Again</button>
    </main>
  );
}
