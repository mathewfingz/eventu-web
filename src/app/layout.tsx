import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eventu - Plataforma de Ticketing de Nueva Generación",
  description:
    "Compra boletas para conciertos, festivales, teatro y más. La plataforma de ticketing más segura de Colombia con tecnología SafeTix.",
  keywords: [
    "boletas",
    "conciertos",
    "eventos",
    "tickets",
    "Colombia",
    "festivales",
  ],
  authors: [{ name: "Eventu" }],
  openGraph: {
    title: "Eventu - Plataforma de Ticketing de Nueva Generación",
    description:
      "Compra boletas para conciertos, festivales, teatro y más. La plataforma de ticketing más segura de Colombia.",
    url: "https://eventu.co",
    siteName: "Eventu",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventu - Plataforma de Ticketing",
    description:
      "La plataforma de ticketing más segura de Colombia con tecnología SafeTix.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className="font-sans antialiased bg-white text-[#212121]">
        {children}
      </body>
    </html>
  );
}
