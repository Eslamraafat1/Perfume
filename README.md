# Nubia — Luxury Perfume Store

A high-end luxury perfume web application built with **Next.js 15 (App Router)** and **Supabase** (PostgreSQL database + Storage for images).

---

## 🚀 Features

- **Luxury Aesthetics**: Rich dark gold design, elegant animations, smooth page transitions, and modern typography.
- **Dynamic Collection**: Products are fetched in real-time from Supabase database.
- **Admin Dashboard**: Real-time management where you can add new fragrances (uploading high-quality images directly to Supabase Storage, entering description, name, and price).
- **Fully Responsive**: Optimized for desktop, tablet, and mobile screens.

---

## 🛠️ Setup Instructions

### 1. Supabase Setup

To make the database and image upload work, follow these simple steps on [Supabase](https://supabase.com):

1. **Create a Project**: Go to Supabase, sign in, and create a new project.
2. **Database Setup**: Open the **SQL Editor** in your Supabase dashboard and run the code in [supabase-setup.sql](file:///c:/Users/AL-handasia/Desktop/perfume/supabase-setup.sql) to create the `products` table and set up the RLS (Row Level Security) policies.
3. **Storage Setup**: Go to the **Storage** section, create a new bucket named `product-images`, and make it **Public**.
4. **API Keys**: Go to **Project Settings** -> **API**, and copy the:
   - `Project URL`
   - `anon public key`

### 2. Local Configuration

Create/update your `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 💻 Running the Application

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the luxury storefront.
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to access the admin panel.

---

## 📦 Deployment on Vercel

1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in Vercel.
4. Deploy! 🚀
