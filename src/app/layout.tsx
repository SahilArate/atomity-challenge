import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atomity — Cloud Cost Intelligence",
  description: "Visualize and optimize your multi-cloud infrastructure costs in real time.",
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('atomity-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = saved || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}