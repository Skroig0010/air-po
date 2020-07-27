import { Behaviour } from '../behaviour'
import { Entity } from '../../ecs/entity'
import { KeyController } from '../../systems/controlSystem'
import { Vec2 } from '../../math/vec2'

const SETTING = {
  CONSUME_SPEED: 10,
  JET_SPEED: 180,
}
const calcPlayerAngle = (): Vec2 => {
  const angle = new Vec2()

  if (KeyController.isActionPressing('MoveLeft')) {
    angle.x -= 1
  }
  if (KeyController.isActionPressing('MoveRight')) {
    angle.x += 1
  }
  if (KeyController.isActionPressing('MoveUp')) {
    angle.y -= 1
  }
  if (KeyController.isActionPressing('MoveDown')) {
    angle.y += 1
  }

  return angle.normalize()
}

export const playerJet = function*(entity: Entity): Behaviour<void> {
  const body = entity.getComponent('RigidBody')
  const airHolder = entity.getComponent('AirHolder')
  const velocity = body.velocity

  const playerAngle = calcPlayerAngle()
  if (
    KeyController.isActionPressing('Jet') &&
    playerAngle.lengthSq() > 0 &&
    airHolder.currentQuantity >= SETTING.CONSUME_SPEED
  ) {
    velocity.x = playerAngle.x * SETTING.JET_SPEED
    velocity.y = playerAngle.y * SETTING.JET_SPEED
    airHolder.consumeBy(SETTING.CONSUME_SPEED)
  }
}
