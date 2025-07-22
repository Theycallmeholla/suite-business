import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import '../../site-styles.css';
import '../../template-styles.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Welcome',
  description: 'Professional service provider'
};

export default function SubdomainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}