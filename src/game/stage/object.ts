import * as t from 'io-ts'
import { CustomPropertyType } from './customProperty'
import { Vec2 } from '@core/math/vec2'

export const StageObjectType = t.type({
  gid: t.union([t.number, t.undefined]),
  height: t.number,
  id: t.number,
  name: t.string,
  properties: t.union([t.array(CustomPropertyType), t.undefined]),
  rotation: t.number,
  type: t.string,
  visible: t.boolean,
  width: t.number,
  x: t.number,
  y: t.number,
  ellipse: t.union([t.boolean, t.undefined]),
})
export type StageObject = t.TypeOf<typeof StageObjectType>

export const calcCenter = (object: StageObject): Vec2 => {
  const { x, y, width, height, ellipse } = object
  return new Vec2(x + width / 2, ellipse ? y + height / 2 : y - height / 2)
}
