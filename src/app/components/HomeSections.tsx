'use client'

import dynamic from 'next/dynamic'

const AboutSection = dynamic(() => import('./sections/AboutSection'), {
  loading: () => null,
})
const ServicesSection = dynamic(() => import('./sections/ServicesSection'), {
  loading: () => null,
})
const PricesSection = dynamic(() => import('./sections/PricesSection'), {
  loading: () => null,
})
const BeforeAfterSection = dynamic(() => import('./sections/BeforeAfterSection'), {
  loading: () => null,
})
const GallerySection = dynamic(() => import('./sections/GallerySection'), {
  loading: () => null,
})
const ReviewsSection = dynamic(() => import('./sections/ReviewsSection'), {
  loading: () => null,
})

export default function HomeSections() {
  return (
    <>
      <AboutSection />
      <ServicesSection />
      <PricesSection />
      <BeforeAfterSection />
      <GallerySection />
      <ReviewsSection />
    </>
  )
}
