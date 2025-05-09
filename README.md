# Product Serial Number Generator

A web-based application for generating, managing, and verifying product serial numbers with QR code support.

## Features

- Generate unique serial numbers for product batches
- QR code generation for each serial number
- Export serial numbers to CSV
- Verify serial number authenticity
- Analytics dashboard with data visualization
- Modern, responsive UI

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up your Supabase database with the following tables and functions:
   ```sql
   -- Create the serial_numbers table
   CREATE TABLE serial_numbers (
     id UUID PRIMARY KEY,
     "productName" TEXT NOT NULL,
     "batchId" UUID NOT NULL,
     "serialNumber" TEXT NOT NULL UNIQUE,
     "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
     "qrCode" TEXT
   );

   -- Create indexes for faster lookups
   CREATE INDEX idx_serial_numbers_serial ON serial_numbers("serialNumber");
   CREATE INDEX idx_serial_numbers_product ON serial_numbers("productName");
   CREATE INDEX idx_serial_numbers_batch ON serial_numbers("batchId");
   CREATE INDEX idx_serial_numbers_date ON serial_numbers("createdAt");

   -- Create the time series function for statistics
   -- See supabase-functions.sql for the full function definition
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Generate Serial Numbers**
   - Enter the product name
   - Specify the quantity of serial numbers needed
   - Use advanced options to customize serial number format
   - Click "Generate Serial Numbers"
   - Export the generated serials to CSV if needed

2. **Verify Serial Numbers**
   - Switch to the "Verify Serial" tab
   - Enter the serial number
   - Click "Verify Serial Number"
   - View the verification result

3. **View Analytics Dashboard**
   - Switch to the "Dashboard" tab
   - See total serials, products, and batches
   - View generation trends over time (weekly, monthly, yearly)
   - Analyze product distribution with interactive charts

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- UUID
- QRCode.js
- Chart.js
- React-Chartjs-2

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── SerialGenerator.tsx    # Serial number generation component
│   │   ├── SerialVerifier.tsx     # Serial number verification component
│   │   └── Statistics.tsx         # Analytics dashboard component
│   ├── globals.css                # Global styles and animations
│   ├── layout.tsx                 # App layout
│   └── page.tsx                   # Main page with tabs
├── lib/
│   └── supabase.ts                # Supabase client configuration
├── public/                        # Static assets
├── supabase-functions.sql         # SQL functions for Supabase
└── ...
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
