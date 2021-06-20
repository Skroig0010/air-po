import { Behaviour } from '@core/behaviour/behaviour'
import { Entity } from '@core/ecs/entity'
import { Vec2 } from '@core/math/vec2'

const SPEED = 0.1

export const fixedCameraAI = function*(
  camera: Entity,
  center: Vec2,
  stopCondition: () => boolean
): Behaviour<void> {
  while (!stopCondition()) {
    const pos = camera.getComponent('Position')
    pos.x += (center.x - pos.x) * SPEED
    pos.y += (center.y - pos.y) * SPEED
    yield
  }
}
