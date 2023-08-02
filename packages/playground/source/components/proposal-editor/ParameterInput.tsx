import type * as T from 'types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import AddressBook from 'components/address-book/AddressBook'
import UnitConverter from './UnitConverter'

type Ev = T.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
interface ParameterInputProps {
  abis?: T.FunctionFragment[] | null
  selectedAbiIndex?: number
  parameters?: T.FnParameters
  paramsValid?: boolean
  handleNewParams: (ev: Ev) => void
}

const ParameterInput: React.FC<ParameterInputProps> = (props) => {
  const { t, i18n } = useTranslation()
  return useMemo(() => {
    if (!props.parameters || !props.abis || !props.selectedAbiIndex) return <></>
    const abi = props.abis[props.selectedAbiIndex]
    return (
      <>
        {abi.inputs.map((input, i) => {
          const showAddressBook = input.type === 'address'
          const showUnits = input.type.startsWith('uint')
          return (
            <TextField
              key={`input_${input.name}`}
              name={String(i)}
              label={`${t('Parameter').toUpperCase()}: ${input.name} - ${input.type}`}
              variant='outlined'
              fullWidth
              value={props.parameters![i] || ''}
              onChange={props.handleNewParams}
              InputProps={{
                endAdornment: (
                  <>
                    <InputAdornment position='end'>
                      {showAddressBook && (
                        <AddressBook
                          onResult={(value) =>
                            props.handleNewParams({
                              target: { name: String(i), value }
                            } as Ev)
                          }
                        />
                      )}
                      {showUnits && (
                        <UnitConverter
                          onResult={(value) =>
                            props.handleNewParams({
                              target: { name: String(i), value }
                            } as Ev)
                          }
                        />
                      )}
                    </InputAdornment>
                  </>
                )
              }}
            />
          )
        })}

        {!props.paramsValid && (
          <Alert color='warning' sx={{ mb: 2 }}>
            {t('Input parameters not valid')}
          </Alert>
        )}
      </>
    )
  }, [props.parameters, props.abis, props.selectedAbiIndex, props.paramsValid, i18n.language])
}

export default ParameterInput
