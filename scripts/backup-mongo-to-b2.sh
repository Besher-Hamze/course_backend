#!/bin/bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-/root/course_backend/.env}"
BACKUP_DIR="${BACKUP_DIR:-/root/course_backend/backups}"
MONGO_CONTAINER="${MONGO_CONTAINER:-mongodb_restored}"
MONGO_DB="${MONGO_DB:-courses}"
KEEP_LOCAL_DAYS="${KEEP_LOCAL_DAYS:-14}"
KEEP_REMOTE_DAYS="${KEEP_REMOTE_DAYS:-30}"
REMOTE_PREFIX="${REMOTE_PREFIX:-db-backups}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

get_env() {
  local key="$1"
  awk -F= -v k="$key" '$1==k {print substr($0, index($0,"=")+1); exit}' "$ENV_FILE"
}

if [[ ! -f "$ENV_FILE" ]]; then
  log "ERROR: missing $ENV_FILE"
  exit 1
fi

MONGODB_URI="$(get_env MONGODB_URI)"
B2_BUCKET="$(get_env B2_BUCKET)"
B2_ENDPOINT="$(get_env B2_ENDPOINT)"
B2_REGION="$(get_env B2_REGION)"
B2_KEY_ID="$(get_env B2_KEY_ID)"
B2_APP_KEY="$(get_env B2_APP_KEY)"

if [[ -z "$MONGODB_URI" || -z "$B2_BUCKET" || -z "$B2_ENDPOINT" || -z "$B2_KEY_ID" || -z "$B2_APP_KEY" ]]; then
  log "ERROR: backup settings are incomplete"
  exit 1
fi

if [[ "$B2_ENDPOINT" != http* ]]; then
  B2_ENDPOINT="https://${B2_ENDPOINT}"
fi
B2_REGION="${B2_REGION:-us-east-005}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
ARCHIVE="$BACKUP_DIR/courses-mongo-${STAMP}.archive.gz"
REMOTE_KEY="${REMOTE_PREFIX}/courses-mongo-${STAMP}.archive.gz"

if ! docker inspect -f '{{.State.Running}}' "$MONGO_CONTAINER" 2>/dev/null | grep -q true; then
  log "ERROR: container $MONGO_CONTAINER is not running"
  exit 1
fi

log "Dumping Mongo database $MONGO_DB from $MONGO_CONTAINER"
docker exec -e MONGO_URI="$MONGODB_URI" -e MONGO_DB="$MONGO_DB" "$MONGO_CONTAINER" \
  sh -c 'mongodump --uri="$MONGO_URI" --db="$MONGO_DB" --archive --gzip' > "$ARCHIVE"

if [[ ! -s "$ARCHIVE" ]]; then
  log "ERROR: dump file is empty"
  exit 1
fi

SIZE="$(du -h "$ARCHIVE" | awk '{print $1}')"
log "Dump ready: $(basename "$ARCHIVE") ($SIZE)"

log "Uploading to B2 bucket $B2_BUCKET as $REMOTE_KEY"
export B2_BUCKET B2_ENDPOINT B2_REGION B2_KEY_ID B2_APP_KEY ARCHIVE REMOTE_KEY REMOTE_PREFIX KEEP_REMOTE_DAYS
python3 - <<'PY'
import os
from datetime import datetime, timezone, timedelta
import boto3
from botocore.config import Config

client = boto3.client(
    "s3",
    endpoint_url=os.environ["B2_ENDPOINT"],
    aws_access_key_id=os.environ["B2_KEY_ID"],
    aws_secret_access_key=os.environ["B2_APP_KEY"],
    region_name=os.environ["B2_REGION"],
    config=Config(s3={"addressing_style": "path"}),
)

bucket = os.environ["B2_BUCKET"]
key = os.environ["REMOTE_KEY"]
path = os.environ["ARCHIVE"]
client.upload_file(path, bucket, key, ExtraArgs={"ContentType": "application/gzip"})
print(f"uploaded s3://{bucket}/{key}")

prefix = os.environ["REMOTE_PREFIX"].rstrip("/") + "/"
keep_days = int(os.environ["KEEP_REMOTE_DAYS"])
cutoff = datetime.now(timezone.utc) - timedelta(days=keep_days)
paginator = client.get_paginator("list_objects_v2")
deleted = 0
for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
    for obj in page.get("Contents", []):
        name = obj["Key"].rsplit("/", 1)[-1]
        if not name.startswith("courses-mongo-"):
            continue
        if obj["LastModified"] < cutoff:
            client.delete_object(Bucket=bucket, Key=obj["Key"])
            deleted += 1
            print(f"deleted old remote {obj['Key']}")
print(f"remote cleanup removed {deleted} object(s)")
PY

find "$BACKUP_DIR" -type f -name 'courses-mongo-*.archive.gz' -mtime +"$KEEP_LOCAL_DAYS" -delete
log "Local copies older than ${KEEP_LOCAL_DAYS} days removed"
log "Backup finished"
