import type { APIRoute } from 'astro';
import { list } from '@vercel/blob';
import db from '../../../lib/db';

export const GET: APIRoute = async ({ cookies }) => {
    // 1. Security Check
    if (!cookies.has('admin_session')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        // 2. Vercel Blob Usage Calculation
        // Note: This consumes "list" operations.
        let blobSize = 0;
        let hasMore = true;
        let cursor;

        // We fetch all blobs to calculate total size
        // For a hobby project this is fine (< 10k files usually)
        while (hasMore) {
            const response = await list({ cursor, limit: 1000, token: import.meta.env.BLOB_READ_WRITE_TOKEN });

            for (const blob of response.blobs) {
                blobSize += blob.size;
            }

            hasMore = response.hasMore;
            cursor = response.cursor;
        }

        // 3. Turso DB Usage Calculation
        const dbResult = await db.execute('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()');
        const dbSize = Number(dbResult.rows[0].size);

        return new Response(JSON.stringify({
            blob: {
                used: blobSize,
                limit: 250 * 1024 * 1024, // 250 MB
                percentage: (blobSize / (250 * 1024 * 1024)) * 100
            },
            db: {
                used: dbSize,
                limit: 9 * 1024 * 1024 * 1024, // 9 GB
                percentage: (dbSize / (9 * 1024 * 1024 * 1024)) * 100
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        console.error('Stats Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
