#!/bin/bash
set -euo pipefail

chmod 700 /root/course_backend/scripts/backup-mongo-to-b2.sh
mkdir -p /root/course_backend/backups

CRON_LINE='20 3 * * * /root/course_backend/scripts/backup-mongo-to-b2.sh >> /root/course_backend/backups/backup.log 2>&1'
EXISTING="$(crontab -l 2>/dev/null || true)"
FILTERED="$(printf '%s\n' "$EXISTING" | grep -v 'course_backend/scripts/backup-mongo-to-b2.sh' || true)"
printf '%s\n%s\n' "$FILTERED" "$CRON_LINE" | crontab -
echo '===CRON==='
crontab -l
echo '===RUN==='
/root/course_backend/scripts/backup-mongo-to-b2.sh
