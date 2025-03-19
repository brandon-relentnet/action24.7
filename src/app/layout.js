import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SquareOrderProvider } from "@/app/context/SquareOrderContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ACTION 24/7 | Premium Billiards Apparel",
  description: "High-quality clothing designed for billiards players who live and breathe the sport, both on and off the table.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-white text-black">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <SquareOrderProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </SquareOrderProvider>
      </body>
    </html>
  );
}