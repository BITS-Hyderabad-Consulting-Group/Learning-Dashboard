import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'keepalive',
    robots: { index: false, follow: false, nocache: true },
};

const BUCKET = 'keepalive';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'];

type Entry = {
    name: string;
    updatedAt: string | null;
    size: number | null;
    url: string | null;
    isImage: boolean;
};

/**
 * Lists the keepalive bucket, signs thumbnails, and writes a visit heartbeat.
 * Every load is therefore a storage read, a storage write and a database read.
 */
async function loadEntries(): Promise<{ entries: Entry[]; error: string | null }> {
    const { data, error } = await supabaseServer.storage
        .from(BUCKET)
        .list('files', { limit: 200, sortBy: { column: 'updated_at', order: 'desc' } });

    if (error) return { entries: [], error: error.message };

    const files = (data ?? []).filter((item) => item.id);
    const paths = files.map((file) => `files/${file.name}`);

    const signed = paths.length
        ? ((await supabaseServer.storage.from(BUCKET).createSignedUrls(paths, 60 * 10)).data ?? [])
        : [];

    const entries = files.map((file, index) => ({
        name: file.name,
        updatedAt: file.updated_at ?? null,
        size: (file.metadata?.size as number | undefined) ?? null,
        url: signed[index]?.signedUrl ?? null,
        isImage: IMAGE_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext)),
    }));

    return { entries, error: null };
}

async function ping() {
    const stamp = new Date().toISOString();

    await supabaseServer.storage
        .from(BUCKET)
        .upload('visits.txt', `last page visit: ${stamp}\n`, {
            contentType: 'text/plain',
            upsert: true,
        });

    await supabaseServer.from('courses').select('id').limit(1);

    return stamp;
}

function formatSize(bytes: number | null) {
    if (bytes === null) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function KeepalivePage({ params }: { params: Promise<{ secret: string }> }) {
    const { secret } = await params;
    const expected = process.env.KEEPALIVE_SECRET;

    if (!expected || secret !== expected) notFound();

    const [{ entries, error }, stamp] = await Promise.all([loadEntries(), ping()]);

    return (
        <main className="mx-auto max-w-3xl p-6 font-mono text-xs">
            <h1 className="text-sm font-semibold">keepalive</h1>
            <p className="mt-1 text-muted-foreground">
                {entries.length} file(s) in the <code>{BUCKET}</code> bucket · pinged {stamp}
            </p>

            {error && <p className="mt-4 text-red-500">storage error: {error}</p>}

            {!error && entries.length === 0 && (
                <p className="mt-4 text-muted-foreground">
                    Nothing yet — drop files in the repo&apos;s <code>keepalive/</code> folder and
                    push.
                </p>
            )}

            <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2">
                {entries.map((entry) => (
                    <li key={entry.name} className="rounded border p-1">
                        {entry.isImage && entry.url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={entry.url}
                                alt={entry.name}
                                width={64}
                                height={64}
                                loading="lazy"
                                className="h-16 w-full rounded object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-full items-center justify-center rounded bg-muted text-[10px] uppercase">
                                {entry.name.split('.').pop()}
                            </div>
                        )}
                        <p className="mt-1 truncate text-[10px]" title={entry.name}>
                            {entry.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            {formatSize(entry.size)}
                        </p>
                    </li>
                ))}
            </ul>
        </main>
    );
}
