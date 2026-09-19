'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'
import type { BeforeAfterItem } from '../../data/siteContent'
import { useBeforeAfter, useDictionary } from '../../../i18n/LocaleProvider'
import { SectionHeading } from './SectionHeading'
import styles from './sections.module.css'

function BeforeAfterSlider({
  item,
  title,
  beforeLabel,
  afterLabel,
}: {
  item: BeforeAfterItem
  title: string
  beforeLabel: string
  afterLabel: string
}) {
  const [position, setPosition] = useState(50)

  const setFromClientX = useCallback((clientX: number, frame: HTMLDivElement) => {
    const rect = frame.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, next)))
  }, [])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setFromClientX(event.clientX, event.currentTarget)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    event.preventDefault()
    setFromClientX(event.clientX, event.currentTarget)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <article className={styles.compareCase}>
      <h3 className={styles.compareCaseTitle}>{title}</h3>
      <div
        className={styles.compareSlider}
        style={{ '--compare-pos': `${position}%` } as React.CSSProperties}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={(event) => event.preventDefault()}
        role="slider"
        aria-label={`${title}: ${beforeLabel} / ${afterLabel}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            setPosition((value) => Math.max(0, value - 2))
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            setPosition((value) => Math.min(100, value + 2))
          }
        }}
      >
        <div className={styles.compareLayer}>
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 960px"
            className={styles.compareImage}
            style={{ objectPosition: item.position }}
            draggable={false}
            priority
          />
        </div>

        <div className={styles.compareBeforeClip}>
          <Image
            src={item.beforeImage || item.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 960px"
            className={styles.compareImage}
            style={{
              objectPosition: item.position,
              ...(item.beforeImage ? {} : { filter: item.beforeFilter }),
            }}
            draggable={false}
            priority
          />
        </div>

        <div className={styles.compareHandle} aria-hidden="true">
          <span className={styles.compareHandleLine} />
          <span className={styles.compareHandleKnob}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4 L2 9 L6 14" />
              <path d="M12 4 L16 9 L12 14" />
            </svg>
          </span>
        </div>

        <span className={`${styles.compareBadge} ${styles.compareBadgeBefore}`}>{beforeLabel}</span>
        <span className={`${styles.compareBadge} ${styles.compareBadgeAfter}`}>{afterLabel}</span>
      </div>
    </article>
  )
}

export default function BeforeAfterSection() {
  const dict = useDictionary()
  const BEFORE_AFTER_ITEMS = useBeforeAfter()

  return (
    <section id="prace" className={`${styles.section} ${styles.beforeAfterSection}`}>
      <div className={styles.inner}>
        <SectionHeading
          title={<>{dict.beforeAfter.titleBefore}<em>{dict.beforeAfter.titleEm}</em></>}
          lead={dict.beforeAfter.placeholder}
        />

        <div className={styles.beforeAfterList}>
          {BEFORE_AFTER_ITEMS.map((item) => (
            <BeforeAfterSlider
              key={item.id}
              item={item}
              title={dict.beforeAfter.items[item.id]?.title || item.id}
              beforeLabel={dict.beforeAfter.before}
              afterLabel={dict.beforeAfter.after}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
