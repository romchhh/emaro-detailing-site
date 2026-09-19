export type ServiceCategory = 'cars' | 'vans' | 'trucks'

export type ServiceTheme = 'dark' | 'photo' | 'photoAlt' | 'light'

export type ServiceItem = {
  id: string
  category: ServiceCategory
  image: string
  imagePosition?: string
  theme: ServiceTheme
}

export type BeforeAfterItem = {
  id: string
  image: string
  beforeImage?: string
  position: string
  beforeFilter: string
}

export type GalleryItem = {
  id: string
  src: string
  kind: 'image' | 'video'
  position: string
}

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const serviceImage = (filename: string) => `/images/emaro/services/${filename}`

/** Verified Unsplash IDs (HTTP 200) — before-after / about fallback */
const IMG = {
  interior: 'photo-1580273916550-e323be2ae537',
  leather: 'photo-1503376780353-7e6692767b70',
  fabric: 'photo-1544636331-e26879cd4d9b',
  wash: 'photo-1558618666-fcd25c85cd64',
  steering: 'photo-1449965408869-eaa3f722e40d',
  road: 'photo-1469854523086-cc02fe5d8800',
  garage: 'photo-1486262715619-67b85e0b08d3',
  truck: 'photo-1586528116311-ad8dd3c8310d',
  sports: 'photo-1492144534655-ae79c964c9d7',
  sedan: 'photo-1502877338535-766e1452684a',
  detail: 'photo-1619405399517-d7fce0f13302',
  van: 'photo-1617531653332-bd46c24f2068',
  team: 'photo-1558618666-fcd25c85cd64',
} as const

export const ABOUT_TEAM_IMAGE = {
  src: u(IMG.team),
  position: 'center 45%',
} as const

export const ABOUT_CTA_IMAGE = {
  src: '/images/emaro/about-cta-car.png',
  position: '100% 100%',
} as const

export const SERVICE_CATEGORIES: ServiceCategory[] = ['cars', 'vans', 'trucks']

export const SERVICES: ServiceItem[] = [
  {
    id: 'cars-interior',
    category: 'cars',
    image: serviceImage('cars-interior.jpg'),
    imagePosition: 'center 42%',
    theme: 'dark',
  },
  {
    id: 'cars-seats-leather',
    category: 'cars',
    image: serviceImage('cars-seats-leather.jpg'),
    imagePosition: 'center 58%',
    theme: 'photo',
  },
  {
    id: 'cars-seats-fabric',
    category: 'cars',
    image: serviceImage('cars-seats-fabric.jpg'),
    imagePosition: 'center 45%',
    theme: 'photoAlt',
  },
  {
    id: 'cars-exterior',
    category: 'cars',
    image: serviceImage('cars-exterior.webp'),
    imagePosition: 'center 48%',
    theme: 'light',
  },
  {
    id: 'vans-interior',
    category: 'vans',
    image: serviceImage('vans-interior.jpg'),
    imagePosition: 'center 38%',
    theme: 'dark',
  },
  {
    id: 'vans-seats',
    category: 'vans',
    image: serviceImage('cars-seats-fabric.jpg'),
    imagePosition: 'center 45%',
    theme: 'photoAlt',
  },
  {
    id: 'vans-exterior',
    category: 'vans',
    image: serviceImage('vans-exterior.jpg'),
    imagePosition: 'center 35%',
    theme: 'photo',
  },
  {
    id: 'trucks-cabin',
    category: 'trucks',
    image: serviceImage('trucks-cabin.jpg'),
    imagePosition: 'center 55%',
    theme: 'photoAlt',
  },
  {
    id: 'trucks-full',
    category: 'trucks',
    image: serviceImage('trucks-full.webp'),
    imagePosition: 'center 40%',
    theme: 'light',
  },
]

export const GALLERY_IMAGES: GalleryItem[] = [
  { id: 'g1', src: '/images/emaro/hero-desktop.png', kind: 'image', position: 'center 42%' },
  { id: 'g2', src: serviceImage('cars-exterior.webp'), kind: 'image', position: 'center 48%' },
  { id: 'g3', src: serviceImage('cars-interior.jpg'), kind: 'image', position: 'center 42%' },
  { id: 'g4', src: serviceImage('cars-seats-leather.jpg'), kind: 'image', position: 'center 58%' },
  { id: 'g5', src: serviceImage('cars-seats-fabric.jpg'), kind: 'image', position: 'center 45%' },
  { id: 'g6', src: serviceImage('vans-interior.jpg'), kind: 'image', position: 'center 38%' },
  { id: 'g7', src: serviceImage('vans-exterior.jpg'), kind: 'image', position: 'center 35%' },
  { id: 'g8', src: serviceImage('trucks-cabin.jpg'), kind: 'image', position: 'center 55%' },
  { id: 'g9', src: serviceImage('trucks-full.webp'), kind: 'image', position: 'center 40%' },
]

export const BEFORE_AFTER_ITEMS: BeforeAfterItem[] = [
  {
    id: 'ba-exterior',
    image: serviceImage('cars-exterior.webp'),
    position: 'center 48%',
    beforeFilter: 'brightness(0.58) saturate(0.42) contrast(1.18) sepia(0.12)',
  },
  {
    id: 'ba-interior',
    image: serviceImage('cars-interior.jpg'),
    position: 'center 42%',
    beforeFilter: 'brightness(0.55) saturate(0.38) contrast(1.22)',
  },
  {
    id: 'ba-leather',
    image: serviceImage('cars-seats-leather.jpg'),
    position: 'center 58%',
    beforeFilter: 'brightness(0.6) saturate(0.48) contrast(1.12) sepia(0.08)',
  },
  {
    id: 'ba-wheels',
    image: serviceImage('vans-exterior.jpg'),
    position: 'center 35%',
    beforeFilter: 'brightness(0.62) saturate(0.5) contrast(1.15)',
  },
]

export type ReviewItem = {
  id: string
  rating: number
}

export const REVIEW_ITEMS: ReviewItem[] = [
  { id: 'r1', rating: 5 },
  { id: 'r2', rating: 5 },
  { id: 'r3', rating: 5 },
  { id: 'r4', rating: 5 },
  { id: 'r5', rating: 5 },
  { id: 'r6', rating: 5 },
]
