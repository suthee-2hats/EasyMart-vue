import banner1Mobile from '@/img/banner/banner1_forMobile.webp'
import banner1Desktop from '@/img/banner/banner1_forDesktop.webp'
import banner1Fallback from '@/img/banner/banner1.webp'

import banner2Mobile from '@/img/banner/banner2 _forMobile.webp'
import banner2Desktop from '@/img/banner/banner2_forDesktop.webp'
import banner2Fallback from '@/img/banner/banner2.webp'

import banner3Mobile from '@/img/banner/banner3 _forMobile.webp'
import banner3Desktop from '@/img/banner/banner3_forDesktop.webp'
import banner3Fallback from '@/img/banner/banner3.png'

export const heroSlides = [
  {
    id: 1,
    mobileImage: banner1Mobile,
    desktopImage: banner1Desktop,
    fallbackImage: banner1Fallback,
    alt: "Father's Day sale — save up to 50% off",
    link: '/offers/fathers-day',
  },
  {
    id: 2,
    mobileImage: banner2Mobile,
    desktopImage: banner2Desktop,
    fallbackImage: banner2Fallback,
    alt: '618 Shopping Festival sale with discounts up to 40% off',
    link: '/offers/618-shopping-festival',
  },
  {
    id: 3,
    mobileImage: banner3Mobile,
    desktopImage: banner3Desktop,
    fallbackImage: banner3Fallback,
    alt: 'Refreshing summer drinks and desserts',
    link: '/offers/summer-collection',
  },
]
