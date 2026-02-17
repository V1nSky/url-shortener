import { useQuery } from '@tanstack/react-query';
import { urlApi } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MousePointer, Users, Globe, Monitor, Download } from 'lucide-react';
import { formatNumber, downloadFile } from '@/lib/utils';
import { useState } from 'react';

interface Props { urlId: string; }

const COLORS = ['#7c6bff', '#ff6b9d', '#6bffce', '#ffd166', '#6366f1', '#ec4899'];

const AnalyticsDashboard = ({ urlId }: Props) => {
  const [days, setDays] = useState(30);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', urlId, days],
    queryFn: () => urlApi.getAnalytics(urlId, days),
    select: (r) => r.data,
  });

  const handleExport = async () => {
    try {
      const response = await urlApi.exportAnalytics(urlId);
      downloadFile(response.data, `analytics-${urlId}.csv`);
    } catch {}
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-[#7c6bff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!analytics) return null;

  const tooltipStyle = {
    backgroundColor: '#111118',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    color: '#e8e8f0',
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <div className="flex items-center gap-3">
          {/* Range tabs */}
          <div className="flex gap-1 bg-[#111118] border border-[#2a2a3a] rounded-xl p-1">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  days === d
                    ? 'bg-[#7c6bff] text-white'
                    : 'text-[#666680] hover:text-[#e8e8f0]'
                }`}
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#111118] border border-[#2a2a3a] text-[#666680] hover:border-[#7c6bff] hover:text-[#7c6bff] rounded-xl text-sm transition-all"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <MousePointer className="w-5 h-5" />, value: formatNumber(analytics.totalClicks), label: 'Total clicks', color: '#7c6bff' },
          { icon: <Users className="w-5 h-5" />, value: formatNumber(analytics.uniqueVisitors), label: 'Unique visitors', color: '#ff6b9d' },
          { icon: <Globe className="w-5 h-5" />, value: analytics.topCountries.length.toString(), label: 'Countries', color: '#6bffce' },
          { icon: <Monitor className="w-5 h-5" />, value: analytics.topDevices.length.toString(), label: 'Devices', color: '#ffd166' },
        ].map((s, i) => (
          <div key={i} className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-5 hover:-translate-y-0.5 transition-transform" style={{ borderTop: `2px solid ${s.color}` }}>
            <div style={{ color: s.color }} className="mb-3">{s.icon}</div>
            <div className="text-3xl font-bold tracking-tight mb-1">{s.value}</div>
            <div className="text-xs text-[#666680]" style={{ fontFamily: "'Space Mono', monospace" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Timeline + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6">
          <div className="text-xs text-[#666680] uppercase tracking-widest mb-5 flex items-center justify-between" style={{ fontFamily: "'Space Mono', monospace" }}>
            Clicks over time
            <span className="text-[#7c6bff]">— {days} days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics.clicksByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
              <XAxis dataKey="date" tick={{ fill: '#666680', fontSize: 10, fontFamily: "'Space Mono', monospace" }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666680', fontSize: 10, fontFamily: "'Space Mono', monospace" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#2a2a3a' }}
                formatter={(v: number) => [v, 'clicks']}
                labelFormatter={(v) => new Date(v).toLocaleDateString()} />
              <Line type="monotone" dataKey="count" stroke="#7c6bff" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#7c6bff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6">
          <div className="text-xs text-[#666680] uppercase tracking-widest mb-5" style={{ fontFamily: "'Space Mono', monospace" }}>Devices</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={analytics.topDevices} cx="50%" cy="45%" outerRadius={75} dataKey="count" nameKey="device"
                labelLine={false}
                label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}>
                {analytics.topDevices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Countries + Browsers + Referers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Countries */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6">
          <div className="text-xs text-[#666680] uppercase tracking-widest mb-5" style={{ fontFamily: "'Space Mono', monospace" }}>Top countries</div>
          <div className="space-y-3">
            {analytics.topCountries.slice(0, 6).map((item, i) => {
              const pct = analytics.totalClicks ? (item.count / analytics.totalClicks) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{item.country || 'Unknown'}</span>
                    <span className="text-xs text-[#666680]" style={{ fontFamily: "'Space Mono', monospace" }}>{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#7c6bff]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6">
          <div className="text-xs text-[#666680] uppercase tracking-widest mb-5" style={{ fontFamily: "'Space Mono', monospace" }}>Browsers</div>
          <div className="space-y-3">
            {analytics.topBrowsers.slice(0, 6).map((item, i) => {
              const pct = analytics.totalClicks ? (item.count / analytics.totalClicks) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{item.browser || 'Unknown'}</span>
                    <span className="text-xs text-[#666680]" style={{ fontFamily: "'Space Mono', monospace" }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referers */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6">
          <div className="text-xs text-[#666680] uppercase tracking-widest mb-5" style={{ fontFamily: "'Space Mono', monospace" }}>Referers</div>
          {analytics.topReferers.length === 0 ? (
            <p className="text-xs text-[#444460] text-center mt-8" style={{ fontFamily: "'Space Mono', monospace" }}>No referrer data yet</p>
          ) : (
            <div className="space-y-2">
              {analytics.topReferers.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-[#1a1a24] rounded-xl px-3 py-2">
                  <span className="text-sm truncate flex-1">{item.referer}</span>
                  <span className="text-xs text-[#666680] ml-3 shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
