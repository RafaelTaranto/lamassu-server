import classnames from 'classnames'
import { Formik, Form, FastField } from 'formik'
import * as R from 'ramda'
import React, { useState } from 'react'
import ErrorMessage from '../../components/ErrorMessage'

import { Button } from '../../components/buttons'
import { SecretInput } from '../../components/inputs/formik'

const FormRenderer = ({
  validationSchema,
  elements,
  value,
  save,
  buttonLabel = 'Save changes',
  buttonClass,
}) => {
  const initialValues = R.compose(
    R.mergeAll,
    R.map(({ code }) => ({ [code]: (value && value[code]) ?? '' })),
  )(elements)

  const values = R.mergeRight(initialValues, value)

  const [saveError, setSaveError] = useState([])

  const saveNonEmptySecret = it => {
    const emptySecretFields = R.compose(
      R.map(R.prop('code')),
      R.filter(
        elem =>
          R.prop('component', elem) === SecretInput &&
          R.isEmpty(it[R.prop('code', elem)]),
      ),
    )(elements)
    return save(R.omit(emptySecretFields, it)).catch(() => {
      setSaveError({ save: 'Failed to save changes' })
    })
  }

  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      enableReinitialize
      initialValues={values}
      validationSchema={validationSchema}
      onSubmit={saveNonEmptySecret}>
      {({ errors }) => (
        <Form className="flex flex-col flex-1">
          <div className="flex flex-col gap-3 mb-6 mt-3">
            {elements.map(
              ({ component, code, display, settings, inputProps }) => (
                <div key={code}>
                  <FastField
                    component={component}
                    {...inputProps}
                    name={code}
                    label={display}
                    settings={settings}
                    fullWidth={true}
                  />
                </div>
              ),
            )}
          </div>
          <div className="flex flex-row mt-auto mb-8">
            {!R.isEmpty(R.mergeRight(errors, saveError)) && (
              <ErrorMessage>
                {R.head(R.values(R.mergeRight(errors, saveError)))}
              </ErrorMessage>
            )}
            <Button
              className={classnames('mt-auto ml-auto', buttonClass)}
              type="submit">
              {buttonLabel}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default FormRenderer
