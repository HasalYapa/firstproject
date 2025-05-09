import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins', 
});

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', 
});

export const metadata: Metadata = {
  title: 'Serial Number Generator | Professional Product Tracking',
  description: 'Generate secure product serial numbers with QR codes. Track and verify product authenticity with a modern, streamlined interface.',
  keywords: ['serial number', 'product tracking', 'qr code', 'product authentication'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
} 