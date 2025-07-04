export type TaxValueType = 'Rate' | 'Value'

export interface Tax {
  value: string
  valueType: TaxValueType
}
