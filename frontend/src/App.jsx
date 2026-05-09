import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { User, Book, Award, CheckCircle, Filter, Database } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function App() {
  const [stats, setStats] = useState({ chartData: [], avg_marks: 0, avg_attendance: 0 });
  const [formData, setFormData] = useState({ name: '', subject: '', marks: '', attendance: '' });
  const [selectedStudent, setSelectedStudent] = useState('All');

  const fetchData = () => {
    fetch('http://127.0.0.1:8000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching data:", err));
  };

  useEffect(() => fetchData(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://127.0.0.1:8000/api/add_student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ name: '', subject: '', marks: '', attendance: '' });
    fetchData();
  };

  const filteredData = selectedStudent === 'All' 
    ? stats.chartData 
    : stats.chartData.filter(d => d.name === selectedStudent);

  const uniqueNames = ['All', ...new Set(stats.chartData.map(item => item.name))];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        
        {/* 1. CENTERED HEADER */}
        <header style={styles.header}>
          <h1 style={styles.title}>Student Performance Analytics</h1>
          <p style={styles.subtitle}>Full-Stack Mini Project: React + FastAPI + SQLite</p>
        </header>

        {/* 2. CENTERED FORM & FILTER */}
        <section style={styles.topSection}>
          <div style={styles.formCard}>
            <div style={styles.cardHeader}>
              <div style={styles.rowBetween}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Database size={20} color="#4f46e5" />
                  <h2 style={styles.cardTitle}>Data Entry Form</h2>
                </div>
                <div style={styles.filterWrapper}>
                  <Filter size={16} color="#64748b" />
                  <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={styles.select}>
                    {uniqueNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <FormInput icon={<User size={16}/>} label="Student Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="e.g. Manikandan" />
                <FormInput icon={<Book size={16}/>} label="Subject" value={formData.subject} onChange={v => setFormData({...formData, subject: v})} placeholder="e.g. Data Science" />
              </div>
              <div style={styles.formGrid}>
                <FormInput icon={<Award size={16}/>} label="Marks" type="number" value={formData.marks} onChange={v => setFormData({...formData, marks: v})} placeholder="0-100" />
                <FormInput icon={<CheckCircle size={16}/>} label="Attendance %" type="number" value={formData.attendance} onChange={v => setFormData({...formData, attendance: v})} placeholder="0-100" />
              </div>
              <button type="submit" style={styles.submitBtn}>Save to Database</button>
            </form>
          </div>
        </section>

        {/* 3. CENTERED KPI BADGES (Below Form) */}
        <div style={styles.kpiRow}>
          <KPIBadge label="Class Avg Marks" value={`${stats.avg_marks}%`} color="#4f46e5" />
          <KPIBadge label="Class Avg Attendance" value={`${stats.avg_attendance}%`} color="#10b981" />
        </div>

        {/* 4. LARGE BAR CHART (Horizontal expanded) */}
        <section style={styles.chartSection}>
          <ChartBox title="Subject Marks Distribution (Full Detail)">
            <div style={{ height: '450px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" angle={-15} textAnchor="end" interval={0} height={80} tick={{fontSize: 12, fontWeight: 500}} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={styles.tooltip} />
                  <Bar dataKey="marks" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={60} label={{ position: 'top', fontSize: 13, fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartBox>
        </section>

        {/* 5. PIE CHART (Below Bar Chart) */}
        <section style={styles.chartSection}>
          <ChartBox title="Attendance Breakdown by Subject">
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={filteredData} dataKey="attendance" nameKey="subject" cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} label>
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{paddingTop: '20px'}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartBox>
        </section>

      </div>
    </div>
  );
}

// COMPONENTS
function FormInput({ label, value, onChange, placeholder, type = "text", icon }) {
  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputWrapper}>
        <span style={styles.inputIcon}>{icon}</span>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required style={styles.input} />
      </div>
    </div>
  );
}

function KPIBadge({ label, value, color }) {
  return (
    <div style={{ ...styles.kpiCard, borderTop: `6px solid ${color}` }}>
      <p style={styles.kpiLabel}>{label}</p>
      <p style={styles.kpiValue}>{value}</p>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div style={styles.chartCard}>
      <h3 style={styles.chartTitle}>{title}</h3>
      {children}
    </div>
  );
}

// STYLES
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '60px 20px', fontFamily: '"Inter", sans-serif' },
  content: { maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' },
  header: { textAlign: 'center' },
  title: { fontSize: '36px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '16px' },
  topSection: { width: '100%' },
  formCard: { backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' },
  rowBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  cardHeader: { marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' },
  cardTitle: { fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 },
  filterWrapper: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '10px' },
  select: { border: 'none', backgroundColor: 'transparent', outline: 'none', fontWeight: '600', color: '#475569', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#94a3b8' },
  input: { width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none' },
  submitBtn: { padding: '16px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' },
  kpiRow: { display: 'flex', gap: '24px', justifyContent: 'center' },
  kpiCard: { flex: 1, backgroundColor: 'white', padding: '24px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  kpiLabel: { margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '600' },
  kpiValue: { margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#1e293b' },
  chartSection: { width: '100%' },
  chartCard: { backgroundColor: 'white', padding: '32px', borderRadius: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
  chartTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '30px', textAlign: 'center' },
  tooltip: { borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
};