'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRGenerator from '@/components/QRGenerator';

interface DashboardData {
  totalToday: number;
  insideCount: number;
  currentlyInside: any[];
  recentExits: any[];
}

const EMPTY_DASHBOARD: DashboardData = {
  totalToday: 0,
  insideCount: 0,
  currentlyInside: [],
  recentExits: [],
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async (currentSearch: string) => {
    try {
      const res = await fetch(`/api/dashboard?search=${encodeURIComponent(currentSearch)}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to load dashboard data');
      }

      setData({
        totalToday: Number(json?.totalToday ?? 0),
        insideCount: Number(json?.insideCount ?? 0),
        currentlyInside: Array.isArray(json?.currentlyInside) ? json.currentlyInside : [],
        recentExits: Array.isArray(json?.recentExits) ? json.recentExits : [],
      });
    } catch (err) {
      console.error(err);
      setData(EMPTY_DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(search);
    const interval = setInterval(() => fetchData(search), 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [search]);

  if (loading) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading Stats...</div>;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Security Dashboard</h1>
            <p className="text-neutral-500">Real-time vehicle tracking & logs</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search by Vehicle, Name or Roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 w-full md:w-64 transition-all"
            />
            <Link href="/" className="px-6 py-2 bg-card border border-border rounded-full hover:bg-background transition-all whitespace-nowrap">
              Home
            </Link>
          </div>
        </header>

        {/* QR Section */}
        <div className="mb-12">
          <QRGenerator />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border p-8 rounded-3xl">
            <p className="text-neutral-500 text-sm font-medium mb-1 uppercase tracking-wider">Total Entries Today</p>
            <p className="text-5xl font-bold text-accent">{data.totalToday}</p>
          </div>
          <div className="bg-card border border-border p-8 rounded-3xl">
            <p className="text-neutral-500 text-sm font-medium mb-1 uppercase tracking-wider">Currently Inside</p>
            <p className="text-5xl font-bold text-green-500">{data.insideCount}</p>
          </div>
          <div className="bg-card border border-border p-8 rounded-3xl">
            <p className="text-neutral-500 text-sm font-medium mb-1 uppercase tracking-wider">Active Alerts</p>
            <p className="text-5xl font-bold text-orange-500">0</p>
          </div>
        </div>

        {/* Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inside Vehicles */}
          <div className="bg-card/50 border border-border rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-border bg-card">
              <h2 className="text-xl font-bold">Currently Inside</h2>
            </div>
            <div className="p-0 max-h-[400px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-background/50">
                  <tr>
                    <th className="px-6 py-3">Vehicle No</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Entry Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.currentlyInside.map((item) => (
                    <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-accent">{item.vehicleNo}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{item.fullName}</div>
                        <div className="text-xs text-neutral-500">{item.rollNo}</div>
                        <div className="text-[10px] text-accent/70 uppercase tracking-tighter">{item.faculty}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400">{new Date(item.entryTime).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {data.currentlyInside.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-neutral-500">No vehicles inside.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Exits */}
          <div className="bg-card/50 border border-border rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-border bg-card">
              <h2 className="text-xl font-bold">Recent Exits</h2>
            </div>
            <div className="p-0 max-h-[400px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-background/50">
                  <tr>
                    <th className="px-6 py-3">Vehicle No</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Exit Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentExits.map((item) => (
                    <tr key={item.id} className="hover:bg-red-500/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-red-500">{item.vehicleNo}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{item.fullName}</div>
                        <div className="text-xs text-neutral-500">{item.faculty}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400">{new Date(item.exitTime).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {data.recentExits.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-neutral-500">No recent exits.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
           <a 
            href="/data/vehicle_logs.csv" 
            download 
            className="text-accent hover:underline text-sm font-medium"
          >
            Download CSV Audit Log
          </a>
        </div>
      </div>
    </main>
  );
}
