import { Field } from 'formik'
import React from 'react'
import {
  TextInput as TextInputFormik,
  Checkbox as CheckboxFormik,
} from '../../../../components/inputs/formik/index.js'
import { H4, P } from '../../../../components/typography'
import * as Yup from 'yup'

const Screen1Information = ({ currentValues }) => {
  return (
    <>
      <H4>Screen 1 Information</H4> {/* TODO Add ? icon */}
      <P>
        On screen 1 you will request the user if he agrees on providing this
        information, or if he wishes to terminate the transaction instead. You
        may disable this screen with the 'Disable permission screen' checkbox.
      </P>
      <Field
        component={TextInputFormik}
        label="Screen title"
        name="screen1Title"
        fullWidth
        disabled={currentValues.disablePermissionScreen}
      />
      <Field
        component={TextInputFormik}
        label="Screen text"
        name="screen1Text"
        multiline
        fullWidth
        rows={5}
        disabled={currentValues.disablePermissionScreen}
      />
      <Field
        component={CheckboxFormik}
        label="Disable permission screen"
        name="disablePermissionScreen"
      />
    </>
  )
}

const validationSchema = Yup.object().shape({
  disablePermissionScreen: Yup.boolean().label('Disable permission screen'),
  screen1Title: Yup.string()
    .label('Screen title')
    .when('disablePermissionScreen', {
      is: false,
      then: schema => schema.required(),
      otherwise: schema => schema.optional(),
    }),
  screen1Text: Yup.string()
    .label('Screen text')
    .when('disablePermissionScreen', {
      is: false,
      then: schema => schema.required(),
      otherwise: schema => schema.optional(),
    }),
})

const defaultValues = {
  screen1Title: '',
  screen1Text: '',
  disablePermissionScreen: false,
}

export default Screen1Information
export { validationSchema, defaultValues }
