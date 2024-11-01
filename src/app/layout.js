// app/layout.js
import { Inter } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";
import ConnectionStatus from "@/components/ui/dev/ConnectionStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Event Manager",
  description: "Manage your events efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <ConnectionStatus />
      </body>
    </html>
  );
}
