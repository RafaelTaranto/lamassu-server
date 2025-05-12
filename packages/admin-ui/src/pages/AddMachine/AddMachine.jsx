import { useMutation, useQuery, gql } from '@apollo/client'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import SvgIcon from '@mui/material/SvgIcon'
import IconButton from '@mui/material/IconButton'
import classnames from 'classnames'
import { Form, Formik, FastField } from 'formik'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import * as R from 'ramda'
import React, { memo, useState, useEffect, useRef } from 'react'
import Title from 'src/components/Title'
import Sidebar from 'src/components/layout/Sidebar'
import { Info2, P } from 'src/components/typography'
import CameraIcon from 'src/styling/icons/ID/photo/zodiac.svg?react'
import CloseIcon from 'src/styling/icons/action/close/zodiac.svg?react'
import CompleteStageIconSpring from 'src/styling/icons/stage/spring/complete.svg?react'
import CompleteStageIconZodiac from 'src/styling/icons/stage/zodiac/complete.svg?react'
import CurrentStageIconZodiac from 'src/styling/icons/stage/zodiac/current.svg?react'
import EmptyStageIconZodiac from 'src/styling/icons/stage/zodiac/empty.svg?react'
import WarningIcon from 'src/styling/icons/warning-icon/comet.svg?react'
import * as Yup from 'yup'

import { Button } from 'src/components/buttons'
import { TextInput } from 'src/components/inputs/formik'
import { primaryColor } from 'src/styling/variables'

const SAVE_CONFIG = gql`
  mutation createPairingTotem($name: String!) {
    createPairingTotem(name: $name)
  }
`
const GET_MACHINES = gql`
  {
    machines {
      name
      deviceId
    }
  }
`

const getSize = R.compose(R.length, R.pathOr([], ['machines']))

const QrCodeComponent = ({ qrCode, name, count, onPaired }) => {
  const timeout = useRef(null)
  const CLOSE_SCREEN_TIMEOUT = 2000
  const { data } = useQuery(GET_MACHINES, { pollInterval: 10000 })

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }
    }
  }, [])

  const addedMachine = data?.machines?.find(m => m.name === name)
  const hasNewMachine = getSize(data) > count && addedMachine
  if (hasNewMachine) {
    timeout.current = setTimeout(
      () => onPaired(addedMachine),
      CLOSE_SCREEN_TIMEOUT,
    )
  }

  return (
    <>
      <Info2>Scan QR code with your new cryptomat</Info2>
      <div className="flex gap-20 pt-6">
        <div
          className="bg-white p-1 rounded-2xl border-solid border-zodiac border-5"
          data-cy={qrCode}>
          <QRCode
            size={280}
            fgColor={primaryColor}
            marginSize={3}
            value={qrCode}
          />
          <div className="flex items-center mb-5 ml-5">
            <CameraIcon />
            <P noMargin className="ml-3">
              Snap a picture and scan
            </P>
          </div>
        </div>
        <div className="max-w-100">
          <div className="flex gap-4 mb-4">
            <div>
              <WarningIcon />
            </div>
            <P noMargin>
              To pair the machine you need scan the QR code with your machine.
              To do this either snap a picture of this QR code or download it
              through the button above and scan it with the scanning bay on your
              machine.
            </P>
          </div>
          {hasNewMachine && (
            <div className="bg-spring3 flex gap-4 p-2">
              <div className="flex items-center">
                <CompleteStageIconSpring />
              </div>
              <Info2 className="text-spring2 m-0">
                Machine has been successfully paired!
              </Info2>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const initialValues = {
  name: '',
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Machine name is required.')
    .max(50)
    .test(
      'unique-name',
      'Machine name is already in use.',
      (value, context) =>
        !R.includes(
          R.toLower(value),
          R.map(R.toLower, context.options.context.machineNames),
        ),
    ),
})

const MachineNameComponent = ({ nextStep, setQrCode, setName }) => {
  const [register] = useMutation(SAVE_CONFIG, {
    onCompleted: ({ createPairingTotem }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`totem: "${createPairingTotem}" `)
      }
      setQrCode(createPairingTotem)
      nextStep()
    },
    onError: e => console.log(e),
  })

  const { data } = useQuery(GET_MACHINES)
  const machineNames = R.map(R.prop('name'), data?.machines || {})

  const uniqueNameValidator = value => {
    try {
      validationSchema.validateSync(value, {
        context: { machineNames: machineNames },
      })
    } catch (error) {
      return error
    }
  }

  return (
    <>
      <Info2 className="mb-6">Machine Name (ex: Coffee shop 01)</Info2>
      <Formik
        validateOnBlur={false}
        validateOnChange={false}
        initialValues={initialValues}
        validate={uniqueNameValidator}
        onSubmit={({ name }) => {
          setName(name)
          register({ variables: { name } })
        }}>
        {({ errors }) => (
          <Form>
            <div>
              <FastField
                name="name"
                label="Enter machine name"
                component={TextInput}
              />
            </div>
            {errors && <P className="text-tomato">{errors.message}</P>}
            <div className="mt-16">
              <Button type="submit">Submit</Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  )
}

const steps = [
  {
    label: 'Machine name',
    component: MachineNameComponent,
  },
  {
    label: 'Scan QR code',
    component: QrCodeComponent,
  },
]

const renderStepper = (step, it, idx) => {
  const active = step === idx
  const past = idx < step
  const future = idx > step

  return (
    <div className="flex relative my-3">
      <span
        className={classnames({
          'mr-6 text-comet': true,
          'text-zodiac font-bold': active,
          'text-zodiac': past,
        })}>
        {it.label}
      </span>
      {active && <CurrentStageIconZodiac />}
      {past && <CompleteStageIconZodiac />}
      {future && <EmptyStageIconZodiac />}
      {idx < steps.length - 1 && (
        <div
          className={classnames({
            'absolute h-7 w-px border border-comet border-solid right-2 top-[18px]': true,
            'border-zodiac': past,
          })}></div>
      )}
    </div>
  )
}

const AddMachine = memo(({ close, onPaired }) => {
  const { data } = useQuery(GET_MACHINES)
  const [qrCode, setQrCode] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState(0)
  const count = getSize(data)

  const Component = steps[step].component

  return (
    <div>
      <Dialog fullScreen open={true} aria-labelledby="form-dialog-title">
        <DialogContent className="p-0 pt-5 bg-ghost">
          <div
            className=" mx-auto flex flex-col flex-col flex-col flex-col
              flex-col flex-col flex-col flex-col w-[1200px] h-full ">
            <div className="flex items-center justify-between">
              <Title>Add Machine</Title>
              <IconButton onClick={close} size="large">
                <SvgIcon color="error">
                  <CloseIcon />
                </SvgIcon>
              </IconButton>
            </div>
            <div className="flex flex-1">
              <Sidebar>
                {steps.map((it, idx) => renderStepper(step, it, idx))}
              </Sidebar>
              <div className="px-12 flex-1">
                <Component
                  nextStep={() => setStep(1)}
                  count={count}
                  onPaired={onPaired}
                  qrCode={qrCode}
                  setQrCode={setQrCode}
                  name={name}
                  setName={setName}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})

export default AddMachine
