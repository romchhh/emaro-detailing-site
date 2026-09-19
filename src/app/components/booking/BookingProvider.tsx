'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import dynamic from 'next/dynamic'
import ScrollBookingPrompt from './ScrollBookingPrompt'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'

const BookingModal = dynamic(() => import('./BookingModal'), { ssr: false })

type BookingContextValue = {
  openBookingModal: () => void
  closeBookingModal: () => void
  isBookingModalOpen: boolean
}

const BookingContext = createContext<BookingContextValue | null>(null)

const PROMPT_DISMISSED_KEY = 'emaro-booking-prompt-dismissed'

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [promptVisible, setPromptVisible] = useState(false)
  const [promptDismissed, setPromptDismissed] = useState(false)

  const openBookingModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeBookingModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const dismissPrompt = useCallback(() => {
    setPromptDismissed(true)
    setPromptVisible(false)
    sessionStorage.setItem(PROMPT_DISMISSED_KEY, '1')
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem(PROMPT_DISMISSED_KEY) === '1') {
      setPromptDismissed(true)
    }
  }, [])

  useEffect(() => {
    if (promptDismissed) return

    const onScroll = () => {
      setPromptVisible(window.scrollY > 520)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [promptDismissed])

  useBodyScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeBookingModal()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeBookingModal])

  return (
    <BookingContext.Provider
      value={{ openBookingModal, closeBookingModal, isBookingModalOpen: isOpen }}
    >
      {children}
      {!promptDismissed && (
        <ScrollBookingPrompt
          visible={promptVisible && !isOpen}
          onBook={openBookingModal}
          onDismiss={dismissPrompt}
        />
      )}
      {isOpen ? <BookingModal isOpen={isOpen} onClose={closeBookingModal} /> : null}
    </BookingContext.Provider>
  )
}

export function useBookingModal() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookingModal must be used within BookingProvider')
  return ctx
}

export function BookingTrigger({
  className,
  children,
  onClick,
}: {
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  const { openBookingModal } = useBookingModal()

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onClick?.()
        openBookingModal()
      }}
    >
      {children}
    </button>
  )
}
