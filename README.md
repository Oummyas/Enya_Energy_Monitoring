# Enya Energy Monitoring

A web app to follow the Linky electricity meters of a set of apartments and spot
unusual consumption that could indicate fraud.

## Features

- **Accounts** – sign up, log in, reset password (Supabase Auth). Each user only sees their own data (Row Level Security).
- **Apartments** – add, edit and delete apartments: owner name, entry date, notes and the appliances in each one
  (TV, refrigerator, stove, washing machine, computer, iron, electric heating).
- **Linky meters** – one meter per apartment, with its consumption (kWh) and an active / not active status.
- **Fraud detection** – an active meter below **100 kWh** is flagged as *suspected fraud*.
  Suspect meters are listed first, highlighted in red, with counters for meters, active meters and suspected fraud.
- Light / dark theme.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, Server Actions) + React 19 + TypeScript
- [Supabase](https://supabase.com) – PostgreSQL database, Auth, Row Level Security (`@supabase/ssr`)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix UI) + [lucide-react](https://lucide.dev) icons

## Getting started

### 1. Prerequisites

- [Node.js](https://nodejs.org) 20 or later
- A free [Supabase](https://supabase.com) account

### 2. Clone and install

```bash
git clone https://github.com/Oummyas/Enya_Energy_Monitoring.git
cd Enya_Energy_Monitoring
npm install
```

### 3. Create a Supabase project

Create a new project on the [Supabase dashboard](https://supabase.com/dashboard).

### 4. Set the environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in the two values from your Supabase project (**Project Settings → API**, or the **Connect** button):

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (or the legacy `anon` key) |

> Never put the `service_role` / secret key in this file. `.env.local` is git-ignored and must never be committed.

### 5. Run the SQL migrations

In the Supabase dashboard, open **SQL Editor** and run these files **in this order**
(copy the content of each file, paste it, click **Run**):

1. `supabase/migrations/001_initial_schema.sql` – creates the `apartments`, `apartment_appliances`
   and `linky_meters` tables and their security policies
2. `supabase/migrations/003_rename_apartment_number.sql` – renames `apartment_number` to `apartment_name`

Each file must be run only once.

### 6. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account.

### 7. (Optional) Load sample data

`supabase/seed/002_sample_data.sql` adds 10 sample apartments with their appliances and meters.

1. Sign up in the app first.
2. In the file, replace the value of `owner_email` (`you@example.com`) with the email of your account.
3. Run it in the **SQL Editor** (after the migrations).

To remove the sample data later:

```sql
delete from public.apartments where notes = 'Sample data';
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
