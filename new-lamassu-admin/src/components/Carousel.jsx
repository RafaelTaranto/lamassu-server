import React, { memo } from 'react'
import ReactCarousel from 'react-material-ui-carousel'
import LeftArrow from 'src/styling/icons/arrow/carousel-left-arrow.svg?react'
import RightArrow from 'src/styling/icons/arrow/carousel-right-arrow.svg?react'

export const Carousel = memo(({ photosData, slidePhoto }) => {
  return (
    <>
      <ReactCarousel
        PrevIcon={<LeftArrow />}
        NextIcon={<RightArrow />}
        navButtonsProps={{
          style: {
            backgroundColor: 'transparent',
            borderRadius: 0,
            color: 'transparent',
            opacity: 1
          }
        }}
        navButtonsWrapperProps={{
          style: {
            marginLeft: -22,
            marginRight: -22
          }
        }}
        autoPlay={false}
        indicators={false}
        navButtonsAlwaysVisible={true}
        next={activeIndex => slidePhoto(activeIndex)}
        prev={activeIndex => slidePhoto(activeIndex)}>
        {photosData.map((item, i) => (
          <div key={i}>
            <div className="items-center justify-center flex">
              <img
                className="object-contain object-center w-75 h-100 mb-10"
                src={`/${item?.photoDir}/${item?.path}`}
                alt=""
              />
            </div>
          </div>
        ))}
      </ReactCarousel>
    </>
  )
})
