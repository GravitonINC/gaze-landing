import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import HowItWorks from '@/components/HowItWorks';
import CreatorRewards from '@/components/CreatorRewards';
import BondingCurve from '@/components/BondingCurve';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsBar />
      <HowItWorks />
      <CreatorRewards />
      <BondingCurve />
      <CTA />
      <Footer />
    </main>
  );
}
