import IconButton from '@mui/material/IconButton'
import { useFormikContext, Form, Formik, Field as FormikField } from 'formik'
import * as R from 'ramda'
import React, { useState, memo } from 'react'
import PromptWhenDirty from '../PromptWhenDirty'
import { H4 } from '../typography'
import EditIconDisabled from '../../styling/icons/action/edit/disabled.svg?react'
import EditIcon from '../../styling/icons/action/edit/enabled.svg?react'
import FalseIcon from '../../styling/icons/table/false.svg?react'
import TrueIcon from '../../styling/icons/table/true.svg?react'
import * as Yup from 'yup'

import { Link } from '../buttons'
import { RadioGroup } from '../inputs/formik'
import { Table, TableBody, TableRow, TableCell } from '../table'
import SvgIcon from '@mui/material/SvgIcon'

const BooleanCell = ({ name }) => {
  const { values } = useFormikContext()
  return values[name] === 'true' ? <TrueIcon /> : <FalseIcon />
}

const BooleanPropertiesTable = memo(
  ({ title, disabled, data, elements, save, forcedEditing = false }) => {
    const [editing, setEditing] = useState(forcedEditing)

    const initialValues = R.fromPairs(
      elements.map(it => [it.name, data[it.name]?.toString() ?? 'false']),
    )

    const validationSchema = Yup.object().shape(
      R.fromPairs(
        elements.map(it => [
          it.name,
          Yup.mixed().oneOf(['true', 'false', true, false]).required(),
        ]),
      ),
    )

    const innerSave = async values => {
      const toBoolean = num => R.equals(num, 'true')
      save(R.mapObjIndexed(toBoolean, R.filter(R.complement(R.isNil))(values)))
      setEditing(false)
    }

    const radioButtonOptions = [
      { display: 'Yes', code: 'true' },
      { display: 'No', code: 'false' },
    ]
    return (
      <div className="flex w-sm flex-col ">
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          enableReinitialize
          onSubmit={innerSave}
          initialValues={initialValues}
          validationSchema={validationSchema}>
          {({ resetForm }) => {
            return (
              <Form>
                <div className="flex items-center">
                  <H4>{title}</H4>
                  {editing ? (
                    <div className="ml-auto">
                      <Link type="submit" color="primary">
                        Save
                      </Link>
                      <Link
                        type="reset"
                        className="ml-5"
                        onClick={() => {
                          resetForm()
                          setEditing(false)
                        }}
                        color="secondary">
                        Cancel
                      </Link>
                    </div>
                  ) : (
                    <IconButton
                      className="my-auto mx-3"
                      onClick={() => setEditing(true)}>
                      <SvgIcon fontSize="small">
                        {disabled ? <EditIconDisabled /> : <EditIcon />}
                      </SvgIcon>
                    </IconButton>
                  )}
                </div>
                <PromptWhenDirty />
                <Table className="w-full">
                  <TableBody className="w-full">
                    {elements.map((it, idx) => (
                      <TableRow
                        key={idx}
                        size="sm"
                        className="h-auto py-2 px-4 flex items-center justify-between min-h-8 even:bg-transparent odd:bg-zircon">
                        <TableCell className="p-0 w-50">{it.display}</TableCell>
                        <TableCell className="p-0 flex">
                          {editing && (
                            <FormikField
                              component={RadioGroup}
                              name={it.name}
                              options={radioButtonOptions}
                              className="flex flex-row m-[-15px] p-0"
                            />
                          )}
                          {!editing && <BooleanCell name={it.name} />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Form>
            )
          }}
        </Formik>
      </div>
    )
  },
)

export default BooleanPropertiesTable
