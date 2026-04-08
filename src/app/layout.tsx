import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyber Attack & Defense Simulator',
  description: 'Scenario-driven cybersecurity simulator for detecting, responding to, and mitigating simulated cyber attacks',
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
