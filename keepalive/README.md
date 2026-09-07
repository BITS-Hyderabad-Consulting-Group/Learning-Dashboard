# keepalive

Drop any file here (an image, a doc, anything), commit, push.

On every deploy `scripts/keepalive-sync.mjs` uploads the contents of this
folder to the private `keepalive` Supabase Storage bucket and pings the
database, which counts as project activity and stops the free-tier project
from being auto-paused after 7 idle days.

Files are also listed as thumbnails on the hidden page at
`/k/<KEEPALIVE_SECRET>` — opening that page is itself another ping.

This README is uploaded too, so the sync has something to do even when the
folder is otherwise empty.
