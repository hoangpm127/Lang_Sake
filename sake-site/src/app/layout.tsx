import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Manrope,
  Pinyon_Script,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: ["400"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Làng Sake - Ocean Park 2",
  description:
    "Làng Sake - Sự Thức Tỉnh: tinh hoa Nhật Bản và trạm sạc năng lượng giữa lòng Ocean City.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-vibe="night">
      <body
        className={`${cormorant.variable} ${manrope.variable} ${pinyon.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
