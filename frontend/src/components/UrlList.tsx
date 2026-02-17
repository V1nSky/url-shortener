import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { urlApi } from '@/lib/api';
import Button from './ui/Button';
import { Copy, Trash2, BarChart3, ExternalLink, Check } from 'lucide-react';
import { formatDate, copyToClipboard } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UrlList = () => {
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['urls', page],
    queryFn: () => urlApi.getUserUrls(page, 10),
    select: (r) => r.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => urlApi.deleteUrl(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['urls'] }),
  });

  const handleCopy = async (url: string, id: string) => {
    const ok = await copyToClipboard(url);
    if (ok) { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-2 border-[#7c6bff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data || data.urls.length === 0) return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-12 text-center">
      <p className="text-[#666680] text-sm" style={{ fontFamily: "'Space Mono', monospace" }}>
        No URLs yet. Create your first short link above!
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#666680] uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
          — Recent links
        </span>
        <span className="text-xs text-[#666680]" style={{ fontFamily: "'Space Mono', monospace" }}>
          {data.total} total
        </span>
      </div>

      <div className="space-y-2">
        {data.urls.map((url) => (
          <div
            key={url.id}
            className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-5 flex items-center gap-4 hover:border-[#7c6bff]/50 transition-all duration-200 hover:translate-x-1 cursor-pointer group"
            onClick={() => navigate(`/analytics/${url.id}`)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-bold text-[#7c6bff]" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {url.shortUrl}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#444460] group-hover:text-[#7c6bff] transition-colors" />
              </div>
              <p className="text-sm text-[#666680] truncate max-w-sm">→ {url.originalUrl}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-[#444460]" style={{ fontFamily: "'Space Mono', monospace" }}>
                <span>{formatDate(url.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {url.clickCount} clicks
                </span>
                {!url.isActive && <span className="text-[#ff6b9d]">inactive</span>}
              </div>
            </div>

            {/* Stats pill */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${
              url.clickCount > 100
                ? 'border-[#ff6b9d]/40 text-[#ff6b9d] bg-[#ff6b9d]/5'
                : 'border-[#2a2a3a] text-[#666680]'
            }`} style={{ fontFamily: "'Space Mono', monospace" }}>
              {url.clickCount > 100 ? '🔥' : '📊'} {url.clickCount}
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleCopy(url.shortUrl, url.id)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a24] border border-[#2a2a3a] text-[#666680] hover:border-[#7c6bff] hover:text-[#7c6bff] transition-all"
              >
                {copiedId === url.id ? <Check className="w-4 h-4 text-[#6bffce]" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => navigate(`/analytics/${url.id}`)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a24] border border-[#2a2a3a] text-[#666680] hover:border-[#7c6bff] hover:text-[#7c6bff] transition-all"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => { if (confirm('Delete this link?')) deleteMutation.mutate(url.id); }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a24] border border-[#2a2a3a] text-[#666680] hover:border-[#ff6b9d] hover:text-[#ff6b9d] transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            ← Prev
          </Button>
          <span className="text-xs text-[#666680]" style={{ fontFamily: "'Space Mono', monospace" }}>
            {page} / {data.totalPages}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
            Next →
          </Button>
        </div>
      )}
    </div>
  );
};

export default UrlList;
