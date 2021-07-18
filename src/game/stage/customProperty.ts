import * as t from 'io-ts'

const CustomPropertyValueType = t.union([t.boolean, t.number, t.string])
export type CustomPropertyValue = t.TypeOf<typeof CustomPropertyValueType>

export const CustomPropertyType = t.type({
  name: t.string,
  type: t.string,
  value: CustomPropertyValueType,
})
export type CustomProperty = t.TypeOf<typeof CustomPropertyType>

export const getCustomProperty = <T extends CustomPropertyValue>(
  object: { properties?: Array<CustomProperty> },
  propertyName: string
): T | undefined =>
  object.properties?.find(property => property.name === propertyName)?.value as T | undefined
