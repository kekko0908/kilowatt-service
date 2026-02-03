import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Pricing from '../components/Pricing';
import Contact from '../components/Contact';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      {/* Anteprime in Home */}
      <section className="py-20 bg-black text-center border-b border-gray-900">
        <div className="container mx-auto">
          <h2 className="text-4xl font-display font-black text-white mb-6">HAI UN'IDEA RIVOLUZIONARIA?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Scopri il nostro programma di accelerazione per progetti creativi.
          </p>
          <a
            href="/power-by"
            className="inline-block border border-neon text-neon px-8 py-3 font-bold uppercase tracking-widest hover:bg-neon hover:text-black transition-all"
          >
            Vai all'area Power By KW
          </a>
        </div>
      </section>
      <Services />
      <Pricing />
      <Contact />
    </>
  );
};

export default HomePage;
