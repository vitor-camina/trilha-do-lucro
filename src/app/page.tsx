'use client';

import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Benefits } from '@/components/landing/Benefits';
import { CTA } from '@/components/landing/CTA';

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Benefits />
      <CTA />

      {/* Footer simples */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Raio-X do Negócio. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
