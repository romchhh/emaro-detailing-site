'use client'


import { useDictionary, useReviews } from '../../../i18n/LocaleProvider'
import { SectionHeading } from './SectionHeading'
import styles from './sections.module.css'

function Stars({ count }: { count: number }) {
  return (
    <div className={styles.stars} aria-label={`${count} / 5`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewIcon() {
  return (
    <span className={styles.reviewIcon} aria-hidden="true">
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="10" r="4" />
        <path d="M6 24 C6 19 9.5 16 14 16 C18.5 16 22 19 22 24" />
      </svg>
    </span>
  )
}

export default function ReviewsSection() {
  const dict = useDictionary()
  const REVIEW_ITEMS = useReviews()

  return (
    <section id="opinie" className={`${styles.section} ${styles.reviewsSection}`}>
      <div className={styles.inner}>
        <SectionHeading
          title={<>{dict.reviews.titleBefore}<em>{dict.reviews.titleEm}</em></>}
          lead={dict.reviews.placeholder}
        />

        <div className={styles.reviewsRow}>
          {REVIEW_ITEMS.map((item) => {
            const copy = dict.reviews.items[item.id]
            if (!copy) return null
            return (
              <article key={item.id} className={styles.reviewCard}>
                <div className={styles.reviewContent}>
                  <ReviewIcon />
                  <Stars count={item.rating} />
                  <p className={styles.reviewText}>&ldquo;{copy.text}&rdquo;</p>
                  <p className={styles.reviewAuthor}>{copy.name}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
