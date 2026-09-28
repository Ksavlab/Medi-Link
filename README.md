# MediLink

A runnable healthcare-access MVP built with Next.js, React, TypeScript and Tailwind CSS.

## Run locally

1. Install Node.js 18.17+ (Node 20 LTS recommended).
2. Open this project folder in a terminal.
3. Run:

```bash
npm install
npm run dev
```

4. Open http://localhost:3000

## Production build

```bash
npm run build
npm start
```

## Deploy

Import this folder into Vercel. The project uses the Next.js Pages Router and does not require environment variables for the demo.

## Next backend step

The current MVP intentionally uses local demo data. For a production release, connect Supabase for:
- user authentication
- facility accounts and verification
- real facilities/services/hours
- patient profiles
- queue records
- blood requests/donor matching
- medications
- audit logs and role-based access

Do not treat the demo health content as medical diagnosis or emergency advice.
