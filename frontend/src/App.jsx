import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function App() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch data from your Python FastAPI server
    fetch('http://127.0.0.1:8000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("API Error:", err));
  }, []);

  if (!stats) return <div style={{ padding: '40px', textAlign: 'center' }}>Connecting to Python Backend...</div>;

  return (
    <div style={{ padding: '40px', backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Student Analytics Dashboard</h1>
      </header>

      {/* Stats Summary Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <StatCard label="Avg Marks" value={`${stats.avg_marks}%`} color="#4f46e5" />
        <StatCard label="Avg Attendance" value={`${stats.avg_attendance}%`} color="#10b981" />
        <StatCard label="Total Subjects" value={stats.total_subjects} color="#8b5cf6" />
      </div>

      {/* Analysis Chart */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>Subject Performance Analysis</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="marks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: `6px solid ${color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{label}</p>
      <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{value}</p>
    </div>
  );
}