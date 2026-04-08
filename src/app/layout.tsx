import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { UTMCapture } from "@/components/UTMCapture";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.trilhadolucro.com.br'),
  title: "Trilha do Lucro | Descubra se sua loja está lucrando de verdade",
  description: "Faça o diagnóstico financeiro da sua loja em menos de 3 minutos. Descubra se está lucrando, quanto precisa vender e o que fazer para crescer.",
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Trilha do Lucro | Diagnóstico financeiro para lojistas",
    description: "Descubra em 3 minutos se sua loja está lucrando de verdade. Grátis.",
    type: "website",
    locale: "pt_BR",
    url: 'https://www.trilhadolucro.com.br',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trilha do Lucro — Diagnóstico financeiro para lojistas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Trilha do Lucro | Diagnóstico financeiro para lojistas",
    description: "Descubra em 3 minutos se sua loja está lucrando de verdade. Grátis.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable} antialiased`}>
      <body className="font-sans bg-brand-bg text-brand-dark">
        {children}
        <UTMCapture />
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JG3YNYBKVT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JG3YNYBKVT');
          `}
        </Script>
        {/* META PIXEL — uncomment and replace PIXEL_ID_HERE with your Pixel ID once available
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'PIXEL_ID_HERE');
            fbq('track', 'PageView');
          `}
        </Script>
        */}
      </body>
    </html>
  );
}
