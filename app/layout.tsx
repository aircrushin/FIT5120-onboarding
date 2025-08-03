import './globals.css';

import { GeistSans } from 'geist/font/sans';

let title = 'Cosmetic Safety Platform | build with ❤ 5120-TM1';
let description =
  'Helping young adults in Malaysia make informed cosmetic choices by checking product safety, understanding risks, and receiving alerts about banned or harmful products.';

export const metadata = {
  title,
  description,
  keywords: ['cosmetic safety', 'Malaysia', 'product scanner', 'health protection', 'beauty safety'],
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
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
