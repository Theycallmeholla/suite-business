import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import '../../site-styles.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Preview - SiteBango',
  description: 'Preview your website before publishing'
};

export default function PreviewLayout({
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