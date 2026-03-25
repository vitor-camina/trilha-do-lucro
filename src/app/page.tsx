'use client';

import { useEffect } from 'react';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Benefits } from '@/components/landing/Benefits';
import { CTA } from '@/components/landing/CTA';

export default function Home() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('teste') === 'trilha2026') {
      sessionStorage.setItem('raiox_test_mode', 'true');
    }
  }, []);

  return (
    <main>
      {/* Header Trilha do Lucro */}
      <header className="flex items-center justify-center py-4 px-6" style={{ backgroundColor: '#1B5E20' }}>
        <div className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="20" cy="20" r="18" stroke="#F9A825" strokeWidth="2.5" fill="none" />
            <circle cx="20" cy="20" r="12" fill="#2E7D32" fillOpacity="0.3" />
            <polygon points="20,5 22.5,20 20,17 17.5,20" fill="#F9A825" />
            <polygon points="20,35 17.5,20 20,23 22.5,20" fill="#1B5E20" />
            <circle cx="20" cy="20" r="2.5" fill="#F9A825" />
            <text x="18.5" y="4" fill="#F9A825" fontSize="4" fontWeight="bold" fontFamily="sans-serif">N</text>
          </svg>
          <div>
            <p className="text-xs font-semibold text-green-300 leading-none tracking-widest uppercase">Trilha do</p>
            <p className="text-xl font-extrabold leading-none tracking-wide" style={{ color: '#F9A825' }}>LUCRO</p>
          </div>
        </div>
      </header>
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
