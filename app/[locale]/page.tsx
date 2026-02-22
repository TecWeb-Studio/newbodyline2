import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Hero from '@/app/sections/Hero'
import Features from '@/app/sections/Features'
import GallerySection from '@/app/sections/Gallery'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <GallerySection />
        <Features />
      </main>
      <Footer />
    </>
  )
}