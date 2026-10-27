# Firebase credentials (do not commit)

Place `firebase-adminsdk.json` here (service account from Firebase Console).

The backend reads it from `FIREBASE_CREDENTIALS_PATH` or defaults to `secrets/firebase-adminsdk.json`.

On the production server, copy the file and ensure the env var points to it if the path differs.
