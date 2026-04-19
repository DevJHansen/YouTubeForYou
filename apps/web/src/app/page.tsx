import { Demo } from "@/components/landing/Demo";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Nav } from "@/components/landing/Nav";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Demo />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
