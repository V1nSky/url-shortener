import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { urlApi } from '@/lib/api';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { ArrowLeft, ExternalLink, Link2 } from 'lucide-react';

const AnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: url, isLoading } = useQuery({
    queryKey: ['url', id],
    queryFn: () => urlApi.getUrlDetails(id!),
    select: (r) => r.data,
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-[#7c6bff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!url || !id) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-[#666680]" style={{ fontFamily: "'Space Mono', monospace" }}>URL not found</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-[#7c6bff] text-white rounded-xl text-sm">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Glow */}
      <div className="fixed w-[500px] h-[500px] rounded-full pointer-events-none" style={{
        background: '#7c6bff', filter: 'blur(140px)', opacity: 0.06, top: '-100px', right: '-100px'
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-6 h-6 text-[#7c6bff]" />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Mono', monospace" }}>
              lnk<span className="text-[#7c6bff]">.</span>dev
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Back + URL info */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-[#666680] hover:text-[#e8e8f0] transition-colors mb-6"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xl font-bold text-[#7c6bff] hover:text-[#9b8eff] transition-colors"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    {url.shortUrl}
                  </a>
                  <ExternalLink className="w-4 h-4 text-[#444460]" />
                </div>
                <p className="text-[#666680] text-sm break-all mb-3">→ {url.originalUrl}</p>
                <div className="flex items-center gap-4 text-xs text-[#444460]" style={{ fontFamily: "'Space Mono', monospace" }}>
                  <span>Created {new Date(url.createdAt).toLocaleDateString()}</span>
                  {url.expiresAt && <span className="text-[#ffd166]">Expires {new Date(url.expiresAt).toLocaleDateString()}</span>}
                  <span className={url.isActive ? 'text-[#6bffce]' : 'text-[#ff6b9d]'}>
                    {url.isActive ? '● active' : '● inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnalyticsDashboard urlId={id} />
      </main>
    </div>
  );
};

export default AnalyticsPage;
