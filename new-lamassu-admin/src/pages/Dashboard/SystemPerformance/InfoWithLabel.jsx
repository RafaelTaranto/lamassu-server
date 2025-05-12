import React from 'react'
import { Info1, Label1 } from 'src/components/typography/index'
const InfoWithLabel = ({ info, label }) => {
  return (
    <div className="flex flex-col">
      <Info1 className="mb-0">{info}</Info1>
      <Label1 className="m-0">{label}</Label1>
    </div>
  )
}

export default InfoWithLabel
