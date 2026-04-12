#!/bin/bash
OUTFILE="backups/prompt-logger-$(date +%Y%m%d-%H%M%S).sql"
pg_dump "$DATABASE_URL" --no-owner --no-acl --file="$OUTFILE"
echo "Saved: $OUTFILE ($(du -sh "$OUTFILE" | cut -f1))"
