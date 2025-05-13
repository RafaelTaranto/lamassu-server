import React, { memo, useState } from 'react'
import styles from './Carousel.module.css'
import LeftArrow from '../styling/icons/arrow/carousel-left-arrow.svg?react'
import RightArrow from '../styling/icons/arrow/carousel-right-arrow.svg?react'

export const Carousel = memo(({ photosData, slidePhoto }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => {
    const newIndex = activeIndex === 0 ? photosData.length - 1 : activeIndex - 1
    setActiveIndex(newIndex)
    slidePhoto(newIndex)
  }

  const handleNext = () => {
    const newIndex = activeIndex === photosData.length - 1 ? 0 : activeIndex + 1
    setActiveIndex(newIndex)
    slidePhoto(newIndex)
  }

  if (!photosData || photosData.length === 0) {
    return null
  }

  return (
    <div className={styles.carouselContainer}>
      {photosData.length > 1 && (
        <button onClick={handlePrev} className={styles.navButton}>
          <LeftArrow />
        </button>
      )}

      <div className={styles.imageContainer}>
        <img
          className={styles.image}
          src={`/${photosData[activeIndex]?.photoDir}/${photosData[activeIndex]?.path}`}
          alt=""
        />
      </div>

      {photosData.length > 1 && (
        <button onClick={handleNext} className={styles.navButton}>
          <RightArrow />
        </button>
      )}
    </div>
  )
})
