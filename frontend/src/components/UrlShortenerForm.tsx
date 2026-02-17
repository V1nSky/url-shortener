import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { urlApi, ShortUrl } from '@/lib/api';
import Button from './ui/Button';
import Input from './ui/Input';
import { Copy, Check, QrCode, Link2 } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

const schema = z.object({
  url: z.string().url('Please enter a valid URL').max(2048),
  customAlias: z.string().min(3).max(20).optional().or(z.literal('')),
  expiresAt: z.string().optional(),
  password: z.string().min(4).max(50).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const UrlShortenerForm = () => {
  const [shortUrl, setShortUrl] = useState<ShortUrl | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      // Убираем пустые строки перед отправкой
      const payload: Record<string, string> = { url: data.url };
      if (data.customAlias && data.customAlias.trim() !== '') payload.customAlias = data.customAlias;
      if (data.expiresAt && data.expiresAt.trim() !== '') payload.expiresAt = data.expiresAt;
      if (data.password && data.password.trim() !== '') payload.password = data.password;
      return urlApi.createUrl(payload as any);
    },
    onSuccess: (response) => { setShortUrl(response.data); reset(); },
  });

  const onSubmit = (data: FormData) => createMutation.mutate(data);

  const handleCopy = async () => {
    if (!shortUrl) return;
    const ok = await copyToClipboard(shortUrl.shortUrl);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Long URL"
            placeholder="https://your-very-long-link.com/goes/here"
            {...register('url')}
            error={errors.url?.message}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Custom Alias (Optional)"
              placeholder="my-link"
              {...register('customAlias')}
              error={errors.customAlias?.message}
            />
            <Input
              label="Expires At (Optional)"
              type="datetime-local"
              {...register('expiresAt')}
              error={errors.expiresAt?.message}
            />
          </div>
          <Input
            label="Password Protection (Optional)"
            type="password"
            placeholder="••••••"
            {...register('password')}
            error={errors.password?.message}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={createMutation.isPending}>
            <Link2 className="w-4 h-4 mr-2" />
            Shorten URL
          </Button>

          {createMutation.isError && (
            <p className="text-sm text-[#ff6b9d] text-center" style={{ fontFamily: "'Space Mono', monospace" }}>
              {(createMutation.error as any)?.response?.data?.error || 'Failed to create short URL'}
            </p>
          )}
        </form>
      </div>

      {shortUrl && (
        <div className="bg-gradient-to-br from-[#7c6bff]/10 to-[#ff6b9d]/5 border border-[#7c6bff]/30 rounded-2xl p-6 animate-fade-up">
          <p className="text-xs text-[#6bffce] uppercase tracking-widest mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>
            ✓ Your short link is ready
          </p>

          <div className="flex items-center gap-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 mb-4">
            <span className="flex-1 font-bold text-[#7c6bff] text-lg" style={{ fontFamily: "'Space Mono', monospace" }}>
              {shortUrl.shortUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                copied
                  ? 'bg-[#6bffce] text-[#0a0a0f]'
                  : 'bg-[#1a1a24] border border-[#2a2a3a] text-[#e8e8f0] hover:border-[#7c6bff] hover:text-[#7c6bff]'
              }`}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-[#666680]" style={{ fontFamily: "'Space Mono', monospace" }}>
              <span className="truncate max-w-xs block">→ {shortUrl.originalUrl}</span>
              {shortUrl.expiresAt && <span className="text-[#ffd166]">⏰ expires {new Date(shortUrl.expiresAt).toLocaleDateString()}</span>}
            </div>
            <a
              href={shortUrl.qrCodeUrl}
              download={`qr-${shortUrl.shortCode}.png`}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-[#2a2a3a] text-[#666680] hover:border-[#6bffce] hover:text-[#6bffce] rounded-xl transition-all"
            >
              <QrCode className="w-4 h-4" />
              Download QR
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortenerForm;
