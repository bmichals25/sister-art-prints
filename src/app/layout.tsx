import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/components/AdminProvider";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "KatiaPrints | Original Artwork, Beautiful Prints",
  description: "Discover and collect high-quality prints of Katia's original artwork. Available as posters, canvas prints, and framed pieces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <CartProvider>
          <AdminProvider>
            {children}
          </AdminProvider>
        </CartProvider>
      </body>
    </html>
  );
}
