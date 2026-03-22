import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Problema } from '@/components/landing/Problema'
import { Features } from '@/components/landing/Features'
import { ComoFunciona } from '@/components/landing/ComoFunciona'
import { Depoimentos } from '@/components/landing/Depoimentos'
import { Precos } from '@/components/landing/Precos'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Problema />
      <Features />
      <ComoFunciona />
      <Depoimentos />
      <Precos />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
