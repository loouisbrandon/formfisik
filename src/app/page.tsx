import type { Metadata } from 'next'
import { Landing } from '@/modules/marketing/landing'

const title = 'FormFisik — Performance, lifestyle e evolução'
const description = 'Alunos, treinos, agenda e gestão para personal trainers. Conheça a plataforma FormFisik, o plano Pro e os projetos Wear e Studio.'
export const metadata: Metadata = {
  title, description,
  openGraph: { title, description, locale: 'pt_BR', type: 'website', images: [{ url: '/images/logocompleta.png', width: 2488, height: 1540, alt: 'FormFisik' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/images/logocompleta.png'] },
}
export default function HomePage() { return <Landing/> }
