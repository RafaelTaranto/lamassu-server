import classnames from 'classnames'
import React from 'react'
import OtpInput from 'react-otp-input'

import classes from './CodeInput.module.css'

const CodeInput = ({
  name,
  value,
  onChange,
  numInputs,
  error,
  inputStyle,
  containerStyle,
}) => {
  return (
    <OtpInput
      id={name}
      value={value}
      onChange={onChange}
      numInputs={numInputs}
      renderSeparator={<span> </span>}
      shouldAutoFocus
      containerStyle={classnames(containerStyle, 'justify-evenly')}
      inputStyle={classnames(
        inputStyle,
        classes.input,
        'font-museo font-black text-4xl',
        error && 'border-tomato',
      )}
      inputType={'tel'}
      renderInput={props => <input {...props} />}
    />
  )
}

export default CodeInput
