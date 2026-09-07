/**
 * Supabase keepalive sync.
 *
 * Uploads everything in the repo's `keepalive/` folder to the private
 * `keepalive` storage bucket and touches the database, so each deploy
 * counts as project activity and the free-tier project is never paused.
 *
 * Never fails the build: any error is logged and the process exits 0.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const envFile of ['.env.local', '.env']) {
    const full = path.join(root, envFile);
    if (!existsSync(full)) continue;
    try {
        const { config } = await import('dotenv');
        config({ path: full });
    } catch {
        // dotenv is optional; hosted builds inject env vars directly.
    }
}

const BUCKET = 'keepalive';
const SOURCE_DIR = path.join(root, 'keepalive');

const CONTENT_TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
};

function log(message) {
    console.log(`[keepalive] ${message}`);
}

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        log('skipped: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
        return;
    }

    const supabase = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) throw bucketError;

    if (!buckets.some((bucket) => bucket.name === BUCKET)) {
        const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
        if (error) throw error;
        log(`created private bucket "${BUCKET}"`);
    }

    const files = existsSync(SOURCE_DIR)
        ? readdirSync(SOURCE_DIR).filter(
              (name) => !name.startsWith('.') && statSync(path.join(SOURCE_DIR, name)).isFile()
          )
        : [];

    for (const name of files) {
        const ext = path.extname(name).toLowerCase();
        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(`files/${name}`, readFileSync(path.join(SOURCE_DIR, name)), {
                contentType: CONTENT_TYPES[ext] ?? 'application/octet-stream',
                upsert: true,
            });
        if (error) throw error;
        log(`uploaded ${name}`);
    }

    // A write plus a read, so both storage and the database see traffic.
    const stamp = new Date().toISOString();
    const { error: heartbeatError } = await supabase.storage
        .from(BUCKET)
        .upload('heartbeat.txt', `last deploy sync: ${stamp}\nfiles: ${files.length}\n`, {
            contentType: 'text/plain',
            upsert: true,
        });
    if (heartbeatError) throw heartbeatError;

    const { error: dbError } = await supabase.from('courses').select('id').limit(1);
    if (dbError) throw dbError;

    log(`ok — ${files.length} file(s) synced at ${stamp}`);
}

try {
    await main();
} catch (error) {
    log(`failed (build continues): ${error?.message ?? error}`);
}
