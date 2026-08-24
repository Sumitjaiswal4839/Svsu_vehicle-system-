import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-neutral-500 text-sm mb-6">Could not find requested resource</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Return Home</Link>
    </main>
  );
}
