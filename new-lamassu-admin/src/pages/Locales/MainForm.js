import React, { useState, memo } from 'react'
import { Form, FastField } from 'formik'
import { compose, join, map, get, isEmpty } from 'lodash/fp'

import { Link } from '../../components/buttons'
import {
  Autocomplete,
  AutocompleteMultiple,
  Checkbox
} from '../../components/inputs'
import {
  EditCell,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell as Td
} from '../../components/table'

import {
  Td as TD1,
  Tr,
  THead,
  TBody,
  Table as Table1
} from '../../components/fake-table/Table'

// import styles from './MainForm.module.scss'
import EditableTable from '../../components/fake-table/EditableTable'
const styles = {}

const sizes = {
  country: 200,
  fiatCurrency: 150,
  languages: 240,
  cryptoCurrencies: 280,
  showRates: 125,
  action: 175
}

const MainForm = memo(
  ({ values, resetForm, submitForm, errors, editing, setEditing, data }) => {
    const [submitted, setSubmitted] = useState(false)

    const displayCodeArray = compose(join(', '), map(get('code')))

    const save = () => {
      setSubmitted(true)
      submitForm()
    }

    const cancel = () => {
      resetForm()
      setSubmitted(false)
      setEditing(false)
    }

    const ViewFields = (
      <>
        <Td>{values.country && values.country.display}</Td>
        <Td>{values.fiatCurrency && values.fiatCurrency.code}</Td>
        <Td>
          {values.languages && values.languages.map(it => it.code).join(', ')}
        </Td>
        <Td>
          {values.cryptoCurrencies &&
            values.cryptoCurrencies.map(it => it.code).join(', ')}
        </Td>
        <Td>{values.showRates ? 'true' : 'false'}</Td>
        <Td rightAlign>
          <Link color='primary' onClick={() => setEditing(true)}>
            Edit
          </Link>
        </Td>
      </>
    )

    const EditFields = (
      <>
        <Td>
          <FastField
            name='country'
            component={Autocomplete}
            suggestions={data && data.countries}
          />
        </Td>
        <Td>
          <FastField
            name='fiatCurrency'
            component={Autocomplete}
            suggestions={data && data.currencies}
          />
        </Td>
        <Td>
          <FastField
            name='languages'
            component={AutocompleteMultiple}
            suggestions={data && data.languages}
          />
        </Td>
        <Td>
          <FastField
            name='cryptoCurrencies'
            component={AutocompleteMultiple}
            suggestions={data && data.cryptoCurrencies}
          />
        </Td>
        <Td>
          <FastField name='showRates' component={Checkbox} />
        </Td>
        <EditCell save={save} cancel={cancel} />
      </>
    )

    return (
      <Form>
        <Table>
          <colgroup>
            <col className={styles.bigColumn} />
            <col className={styles.mediumColumn} />
            <col className={styles.mediumColumn} />
            <col className={styles.bigColumn} />
            <col className={styles.showRates} />
            <col className={styles.actionColumn} />
          </colgroup>
          <TableHead>
            <TableRow header>
              <TableHeader>Country</TableHeader>
              <TableHeader>Fiat Currency</TableHeader>
              <TableHeader>Languages</TableHeader>
              <TableHeader>Crypto Currencies</TableHeader>
              <TableHeader>Show Rates</TableHeader>
              <TableHeader />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow error={submitted && !isEmpty(errors)}>
              {editing ? EditFields : ViewFields}
            </TableRow>
          </TableBody>
        </Table>

        <EditableTable
          cancel={cancel}
          save={save}
          data={[{}]}
          elements={[
            {
              header: 'Country',
              size: sizes.country,
              view: get('country.display')(values),
              edit: <FastField name='country' component={Autocomplete} />
            },
            {
              header: 'Fiat Currency',
              size: sizes.fiatCurrency,
              view: get('fiatCurrency.code')(values),
              edit: <FastField name='fiatCurrency' component={Autocomplete} suggestions={data && data.currencies} />
            },
            {
              header: 'Languages',
              size: sizes.languages,
              view: displayCodeArray(values.languages),
              edit: <FastField name='languages' component={AutocompleteMultiple} suggestions={data && data.languages} />
            },
            {
              header: 'Crypto Currencies',
              size: sizes.languages,
              view: displayCodeArray(values.cryptoCurrencies),
              edit: <FastField name='cryptoCurrencies' component={AutocompleteMultiple} suggestions={data && data.cryptoCurrencies} />
            },
            {
              header: 'Show Rates',
              size: sizes.showRates,
              view: values.showRates ? 'true' : 'false',
              edit: <FastField name='showRates' component={Checkbox} />
            }
          ]}
        />

        <Table1>
          <THead>
            <TD1 header size={sizes.country}>
              Country
            </TD1>
            <TD1 header size={sizes.fiatCurrency}>
              Fiat Currency
            </TD1>
            <TD1 header size={sizes.languages}>
              Languages
            </TD1>
            <TD1 header size={sizes.cryptoCurrencies}>
              Crypto Currencies
            </TD1>
            <TD1 header size={sizes.showRates}>
              Show Rates
            </TD1>
            <TD1 header size={sizes.action} />
          </THead>
          <TBody>
            <Tr>
              <TD1 size={sizes.country}>
                <FastField
                  name='country'
                  component={Autocomplete}
                  suggestions={data && data.countries}
                />
              </TD1>
              <TD1 size={sizes.fiatCurrency}>
                <FastField
                  name='fiatCurrency'
                  component={Autocomplete}
                  suggestions={data && data.currencies}
                />
              </TD1>
              <TD1 size={sizes.languages}>
                <FastField
                  name='languages'
                  component={AutocompleteMultiple}
                  suggestions={data && data.languages}
                />
              </TD1>
              <TD1 size={sizes.cryptoCurrencies}>
                <FastField
                  name='cryptoCurrencies'
                  component={AutocompleteMultiple}
                  suggestions={data && data.cryptoCurrencies}
                />
              </TD1>
              <TD1 size={sizes.showRates}>
                <FastField name='showRates' component={Checkbox} />
              </TD1>
              <TD1 size={sizes.action} />
            </Tr>
          </TBody>
        </Table1>
      </Form>
    )
  }
)

export default MainForm
