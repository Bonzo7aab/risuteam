'use client'

import * as React from 'react'
import Image from 'next/image'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

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
]

export type RadialCarouselSlide = {
  image: string
  title: string
  category: string
}

const R = 220
const THETA = 32
const AUTOPLAY_MS = 4500
const CARD_W = 220
const CARD_H = 300

const SPRING = { type: 'spring' as const, stiffness: 160, damping: 28, mass: 1 }
const SPRING_FAST = { type: 'spring' as const, stiffness: 280, damping: 26, mass: 0.85 }

function arcStyle(offset: number) {
  const rad = (offset * THETA * Math.PI) / 180
  const abs = Math.abs(offset)

  return {
    x: R * Math.sin(rad),
    rotateY: -offset * THETA,
    scale: Math.max(0.55, 1 - abs * 0.14),
    opacity: abs > 2 ? 0 : Math.max(0.2, 1 - abs * 0.32),
    zIndex: 10 - abs,
    filter: abs === 0 ? 'brightness(1)' : 'brightness(0.78)',
  }
}

function isLocalSrc(src: string) {
  return src.startsWith('/') || src.startsWith('data:')
}

const RadialCarousel = ({ slides = Images }: { slides?: RadialCarouselSlide[] }) => {
  const total = slides.length
  const [active, setActive] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const [lightboxOpen, setLightboxOpen] = React.useState(false)
  const [userDriven, setUserDriven] = React.useState(false)
  const prefersReducedMotion = useReducedMotion()

  const activeSlide = slides[active] ?? slides[0]
  const autoplayStopped = prefersReducedMotion || paused || lightboxOpen || total < 2

  const go = React.useCallback(
    (dir: 1 | -1, fromUser = false) => {
      if (lightboxOpen) return
      if (fromUser) setUserDriven(true)
      setActive((i) => (i + dir + total) % total)
    },
    [total, lightboxOpen]
  )

  const onSlideClick = React.useCallback((index: number) => {
    setUserDriven(true)
    setActive(index)
    setLightboxOpen(true)
    setPaused(true)
  }, [])

  React.useEffect(() => {
    if (autoplayStopped) return
    const id = window.setInterval(() => {
      setUserDriven(false)
      setActive((i) => (i + 1) % total)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [autoplayStopped, total])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxOpen) return
      if (e.key === 'ArrowLeft') go(-1, true)
      else if (e.key === 'ArrowRight') go(1, true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go, lightboxOpen])

  const transition = userDriven ? SPRING_FAST : SPRING

  return (
    <>
      <div
        className="flex w-full flex-col items-center gap-6 py-4 select-none sm:gap-7 sm:py-6"
        onMouseEnter={() => {
          if (!lightboxOpen) setPaused(true)
        }}
        onMouseLeave={() => {
          if (!lightboxOpen) setPaused(false)
        }}
      >
        <div
          className="relative h-[20.5rem] w-full max-w-[34rem] perspective-distant sm:h-[21.5rem]"
          aria-live="polite"
        >
          {/* Soft stage glow behind the coverflow */}
          <div
            className="pointer-events-none absolute inset-x-[18%] bottom-6 h-16 rounded-full bg-primary/20 blur-2xl dark:bg-primary/15"
            aria-hidden
          />

          {slides.map((slide, i) => {
            const raw = (i - active + total) % total
            const offset = raw > total / 2 ? raw - total : raw
            const { x, rotateY, scale, opacity, zIndex, filter } = arcStyle(offset)
            const isActive = offset === 0

            return (
              <motion.button
                key={`${slide.image}-${i}`}
                type="button"
                className={cn(
                  'absolute top-0 left-1/2 transform-3d border-0 bg-transparent p-0 text-left outline-none',
                  isActive ? 'cursor-zoom-in' : 'cursor-pointer'
                )}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  marginLeft: -CARD_W / 2,
                  zIndex,
                }}
                animate={{ x, rotateY, scale, opacity, filter }}
                transition={transition}
                onClick={() => onSlideClick(i)}
                aria-label={
                  isActive
                    ? `Powiększ: ${slide.title}`
                    : `Pokaż i powiększ: ${slide.title}`
                }
                aria-current={isActive ? 'true' : undefined}
              >
                <div
                  className={cn(
                    'relative size-full overflow-hidden rounded-2xl bg-stone-200 shadow-[0_18px_40px_-16px_rgba(28,22,13,0.45)] ring-1 ring-black/8 transition-[box-shadow,ring-color] duration-300 dark:bg-stone-800 dark:ring-white/10',
                    isActive &&
                      'shadow-[0_24px_48px_-14px_rgba(244,157,37,0.35)] ring-2 ring-primary/70 dark:ring-primary/60'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="size-full object-cover"
                    draggable={false}
                  />

                  <div
                    className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent"
                    aria-hidden
                  />

                  <motion.div
                    className="absolute inset-x-0 bottom-0 px-4 pb-4"
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: isActive ? 0 : 10,
                    }}
                    transition={{ duration: 0.28 }}
                  >
                    <span className="text-[10px] font-bold tracking-[0.18em] text-primary uppercase">
                      {slide.category}
                    </span>
                    <p className="mt-0.5 text-sm font-semibold leading-snug text-white">
                      {slide.title}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-white/75">
                      <span className="material-symbols-outlined text-[14px]" aria-hidden>
                        zoom_in
                      </span>
                      Kliknij, aby powiększyć
                    </p>
                  </motion.div>
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Poprzednie zdjęcie"
            disabled={lightboxOpen}
            onClick={() => go(-1, true)}
            className="flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-text-main shadow-card transition-all hover:-translate-y-0.5 hover:text-primary disabled:pointer-events-none disabled:opacity-40 motion-reduce:hover:translate-y-0 dark:border-white/12 dark:bg-surface-dark dark:text-stone-200 dark:shadow-card-dark"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              chevron_left
            </span>
          </button>

          <div className="flex items-center gap-1.5 px-1" role="tablist" aria-label="Slajdy">
            {slides.map((slide, i) => (
              <button
                key={`dot-${slide.image}-${i}`}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Slajd ${i + 1}: ${slide.title}`}
                disabled={lightboxOpen}
                onClick={() => {
                  setUserDriven(true)
                  setActive(i)
                }}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 disabled:opacity-40',
                  i === active
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-stone-300 hover:bg-stone-400 dark:bg-stone-600 dark:hover:bg-stone-500'
                )}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Następne zdjęcie"
            disabled={lightboxOpen}
            onClick={() => go(1, true)}
            className="flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-text-main shadow-card transition-all hover:-translate-y-0.5 hover:text-primary disabled:pointer-events-none disabled:opacity-40 motion-reduce:hover:translate-y-0 dark:border-white/12 dark:bg-surface-dark dark:text-stone-200 dark:shadow-card-dark"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <Dialog
        open={lightboxOpen}
        onOpenChange={(open) => {
          setLightboxOpen(open)
          if (!open) setPaused(false)
        }}
      >
        <DialogContent
          className={cn(
            'max-w-[96vw] w-[96vw] sm:w-[92vw] md:w-[88vw] lg:w-[78vw] xl:w-[70vw]',
            'max-h-[90vh] overflow-hidden border-0 bg-transparent p-0 shadow-none'
          )}
        >
          <DialogTitle className="sr-only">
            {activeSlide?.title ?? 'Powiększone zdjęcie'}
          </DialogTitle>

          <AnimatePresence>
            {lightboxOpen && activeSlide ? (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="relative h-[86vh] w-full overflow-hidden rounded-2xl bg-black/50 shadow-2xl backdrop-blur-md sm:h-[88vh]"
              >
                {isLocalSrc(activeSlide.image) ? (
                  <Image
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    fill
                    sizes="(max-width: 640px) 96vw, (max-width: 1024px) 88vw, 70vw"
                    className="object-contain"
                    priority
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    className="absolute inset-0 size-full object-contain"
                  />
                )}

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-linear-to-b from-black/55 to-transparent p-3 sm:p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                      {activeSlide.category}
                    </p>
                    <p className="truncate text-sm font-semibold text-white sm:text-base">
                      {activeSlide.title}
                    </p>
                  </div>
                  <DialogClose asChild>
                    <button
                      type="button"
                      aria-label="Zamknij podgląd"
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </DialogClose>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RadialCarousel
