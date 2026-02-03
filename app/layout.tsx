import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outflowy",
  description: "Workflowy data under your command",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <h1>Outflowy</h1>
        {children}
      </body>
    </html>
  );
}
