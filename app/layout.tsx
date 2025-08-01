import './globals.css';

import { GeistSans } from 'geist/font/sans';

let title = 'Next.js + Postgres Starter';
let description =
  'This is a Next.js starter kit with Postgres database and Drizzle ORM for database operations.';

export const metadata = {
  title,
  description,
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  metadataBase: new URL('https://nextjs-postgres-starter.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.variable}>{children}</body>
    </html>
  );
}
