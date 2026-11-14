# Weekly email images

Drop lifestyle / drill / health stills for the 26-week series in this folder.
The live site serves them at:

    https://thedinkhousepb.com/email/weekly/<filename>

Email clients need absolute HTTPS URLs, so images must be deployed here (or on
CloudFront) before a send — a local path will render as a broken image.

To use one, point a week's `heroSrc` / `photoSrc` at
`${WEEKLY_IMAGES.siteBase}/<filename>` in
`backend/src/lib/weekly-emails.ts`, then regenerate previews:

    cd backend && npx tsx scripts/preview-weekly-emails.ts

Facility/court shots already live on CloudFront (see `WEEKLY_IMAGES` in the
same file) — reuse those where a real Dink House photo fits.
