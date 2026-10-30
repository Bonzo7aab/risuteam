'use client'

import * as React from 'react'

import { motion, useReducedMotion } from 'motion/react'

import { Carousel, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

const Images = [
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-42.png',
    title: 'Mountain Sunrise',
    category: 'Nature'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-41.png',
    title: 'Ocean Waves',
    category: 'Seascape'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-40.png',
    title: 'Forest Path',
    category: 'Woodland'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-39.png',
    title: 'Desert Dunes',
    category: 'Landscape'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-38.png',
    title: 'City Lights',
    category: 'Urban'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-74.png',
    title: 'Autumn Colors',
    category: 'Seasonal'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/gallery/image-75.png',
    title: 'Winter Frost',
    category: 'Weather'
  }
]

export type RadialCarouselSlide = {
  image: string
  title: string
  category: string
}

const R = 240 // cylinder radius (px)
const THETA = 35 // angular step between neighbours (degrees)
const AUTOPLAY_MS = 4200

const SPRING = { type: 'spring' as const, stiffness: 180, damping: 28, mass: 1 }
const SPRING_FAST = { type: 'spring' as const, stiffness: 280, damping: 26, mass: 0.85 }

function arcStyle(offset: number) {
  const rad = (offset * THETA * Math.PI) / 180
  const abs = Math.abs(offset)

  return {
    x: R * Math.sin(rad),
    rotateY: -offset * THETA,
    scale: Math.max(0.48, 1 - abs * 0.16),
    opacity: abs > 2 ? 0 : Math.max(0.12, 1 - abs * 0.38),
    zIndex: 10 - abs
  }
}

const RadialCarousel = ({ slides = Images }: { slides?: RadialCarouselSlide[] }) => {
  const total = slides.length
  const [active, setActive] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const [userDriven, setUserDriven] = React.useState(false)
  const prefersReducedMotion = useReducedMotion()

  const go = React.useCallback(
    (dir: 1 | -1, fromUser = false) => {
      if (fromUser) setUserDriven(true)
      setActive(i => (i + dir + total) % total)
    },
    [total]
  )

  const goTo = React.useCallback((index: number) => {
    setUserDriven(true)
    setActive(index)
  }, [])

  // Slow continuous loop — pauses on hover / focus / reduced motion
  React.useEffect(() => {
    if (prefersReducedMotion || paused || total < 2) return
    const id = window.setInterval(() => {
      setUserDriven(false)
      setActive(i => (i + 1) % total)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [prefersReducedMotion, paused, total])

  // Keyboard navigation
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1, true)
      else if (e.key === 'ArrowRight') go(1, true)
    }

    window.addEventListener('keydown', handler)

    return () => window.removeEventListener('keydown', handler)
  }, [go])

  const transition = userDriven ? SPRING_FAST : SPRING

  return (
    <Carousel
      className='flex w-full flex-col items-center gap-8 py-8 select-none'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false)
        }
      }}
    >
      <div className='relative h-75 w-full perspective-distant' aria-live='polite'>
        {slides.map((slide, i) => {
          // Shortest signed offset around the loop
          const raw = (i - active + total) % total
          const offset = raw > total / 2 ? raw - total : raw
          const { x, rotateY, scale, opacity, zIndex } = arcStyle(offset)

          return (
            <motion.div
              key={i}
              className='absolute top-0 left-1/2 cursor-pointer transform-3d'
              style={{ width: 200, height: 280, marginLeft: -100, zIndex }}
              animate={{ x, rotateY, scale, opacity }}
              transition={transition}
              onClick={() => goTo(i)}
              aria-label={`View ${slide.title}`}
              aria-current={offset === 0 ? 'true' : undefined}
            >
              <div className='relative size-full overflow-hidden rounded-2xl shadow-lg'>
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.image} alt={slide.title} className='size-full object-cover' draggable={false} />

                {/* Gradient veil */}
                <div className='absolute inset-0 bg-linear-to-t from-primary/70 via-primary/5 to-transparent' />

                {/* Active-only label - Images in from below on focus */}
                <motion.div
                  className='absolute inset-x-0 bottom-0 px-4 pb-5'
                  animate={{ opacity: offset === 0 ? 1 : 0, y: offset === 0 ? 0 : 12 }}
                  transition={{ duration: 0.28 }}
                >
                  <span className='text-[10px] font-medium tracking-[0.18em] text-primary-foreground uppercase'>
                    {slide.category}
                  </span>
                  <p className='mt-0.5 text-sm leading-snug font-semibold text-primary-foreground'>{slide.title}</p>
                </motion.div>

                {/* Active ring */}
                <motion.div
                  className='pointer-events-none absolute inset-0 rounded-2xl'
                  animate={{ opacity: offset === 0 ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className='flex items-center gap-3'>
        <CarouselPrevious
          className='static top-auto left-auto translate-y-0'
          type='button'
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            go(-1, true)
          }}
          disabled={false}
        />

        <CarouselNext
          className='static top-auto right-auto translate-y-0'
          type='button'
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            go(1, true)
          }}
          disabled={false}
        />
      </div>
    </Carousel>
  )
}

export default RadialCarousel
