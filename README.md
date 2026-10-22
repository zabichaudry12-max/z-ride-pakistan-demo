# Z Ride Pakistan

A mobile-friendly ride-hailing demo for Islamabad and Rawalpindi, inspired by the passenger-driver negotiation model of InDrive, but built with original branding and a free-tier stack.

This project is intentionally a functional demo with sample rides and mock driver availability. It is clearly labeled as such and does not simulate live GPS, real driver presence, or production ride fulfillment.

## Overview

- Passenger flow: register, submit a fare request, receive multiple offers, accept one, and confirm booking.
- Driver flow: registration, approval workflow, rides, offer submission, status updates, trip history, and ratings.
- Admin flow: review driver applications, approve or reject them, manage rides, and suspend suspicious activity.
- Cash payment only: no online payment gateway is included.
- Mobile-first UI using dark navy, white, and green accents. Works as a PWA on iPhone/Android.
- Free-tier friendly setup with React, Vite, Supabase, Leaflet, and static hosting.

## Tech stack

- React + TypeScript
- Vite frontend
- Supabase Auth + PostgreSQL + RLS
- Leaflet + OpenStreetMap tiles
- PWA support via Vite PWA
- GitHub for version control
- Netlify or Vercel for free static hosting

## Demo app status

This repository is a demo-first implementation. It includes:

- mock ride data for sample requests and offers
- mock driver availability and temporary in-memory UI state
- a supabase-ready app shell with environment variables
- SQL for schema and RLS, ready to connect to a real Supabase project

The app clearly labels all non-real functionality so it is not mistaken for live operations.

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Set up environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase values.

```bash
cp .env.example .env.local
```

Example:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Do not expose the Supabase service role key in frontend code. It should remain only in a secure server-side environment or not be used in the browser at all.

### 3) Start the app locally

```bash
npm run dev
```

Open the local URL shown in the terminal, commonly:

```txt
http://localhost:5173
```

## Supabase setup

### 1) Create a project

- Go to https://supabase.com
- Create a new project
- Copy your project URL and anon key
- Add them to `.env.local`

### 2) Run the SQL schema

Use the file at `supabase/schema.sql` inside your Supabase SQL editor.

This script includes:

- user profiles
- driver applications
- vehicle records
- ride requests and offers
- accepted rides and statuses
- rating storage
- complaint records
- secure RLS policies
- a transaction-safe assignment helper

### 3) Enable authentication

In Supabase:

- Authentication > Providers > Email
- Enable email sign-in for simple demo registration and login
- Optionally enable anonymous or OAuth if needed later

### 4) Secure storage and permissions

Use the supplied row-level security policies. They restrict:

- public access to identity documents
- drivers to their own applications and vehicle records
- passengers to their own requests and ratings
- admins to approval and moderation screens

## Database schema notes

The included `supabase/schema.sql` defines tables like:

- `profiles`
- `driver_applications`
- `vehicles`
- `ride_requests`
- `ride_offers`
- `rides`
- `ratings`
- `complaints`

A helper function, `assign_ride_offer`, is defined to guard against the same ride being assigned to multiple drivers. This is the database-side safeguard that mirrors the requirement for transaction-safe assignment logic.

## PWA and mobile deployment

This app includes a Vite PWA configuration so it can be installed on iPhone and Android.

### Local install check

- Run the dev server.
- Open the site in a mobile browser.
- Use the browser menu to add to home screen or install.

### Free deployment options

#### Netlify

1. Push the project to GitHub.
2. In Netlify, select New site from Git > GitHub.
3. Import the repository.
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy.

#### Vercel

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Framework preset: Vite
4. Set build command: `npm run build`
5. Add the environment variables listed above.
6. Deploy.

## Folder structure

```txt
.
├── public/
│   └── icon.svg
├── src/
│   ├── App.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── index.css
│   ├── lib/
│   │   └── supabase.ts
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── supabase/
│   └── schema.sql
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
└── .gitignore
```

## Functional demo guide

1. Open the app in the browser.
2. Select a role: Passenger, Driver or Admin.
3. Use the passenger panel to create a ride request.
4. View mock driver offers and accept a ride offer.
5. Use the driver panel to submit an offer for a ride.
6. Use the admin panel to approve or reject driver applications.

## Testing checklist before public launch

- [ ] Browser runs without console errors
- [ ] Ride request form validates empty fields
- [ ] Fare form rejects invalid negative or zero numbers
- [ ] Driver offer accepts a valid fare and rejects invalid input
- [ ] Admin approval changes status correctly
- [ ] Ride assignment does not accept duplicate drivers
- [ ] Loading states appear while auth or data loads
- [ ] Empty states render correctly when no offers exist
- [ ] Mobile layout remains readable on a narrow viewport
- [ ] PWA install banner works on supported browsers
- [ ] Supabase environment variables are not exposed in frontend source
- [ ] SQL migrations run cleanly in a fresh project

## Security checklist before public launch

- [ ] Only use Supabase anon key in the browser
- [ ] Never expose the service-role key in frontend code
- [ ] RLS policies are enabled on all sensitive tables
- [ ] Identity documents are stored only in private buckets or restricted tables
- [ ] Admin dashboard is protected by role checks
- [ ] Driver documents are not accessible in public APIs
- [ ] Ride assignment logic prevents duplicate driver selection
- [ ] Use row-level policies to limit row visibility by user role
- [ ] Validate all inputs on frontend and backend
- [ ] Review logs, auth flows, and abuse actions before release

## Mock functionality notice

The following features are intentionally simulated in this demo and should not be treated as production functionality:

- driver availability
- mock ride requests and offers
- fake live location searches
- sample bookings and statuses
- simulated app authentication in demo mode
- sample GPS-style map movement

## Beginner-friendly run instructions

```bash
npm install
cp .env.example .env.local
npm run dev
```

If you want to connect to Supabase, replace the sample values in `.env.local` with your real project credentials and import `supabase/schema.sql` into your Supabase project.

## License

MIT
