import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Free academic search',
  description: 'Free academic search - Built with Rust + Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
