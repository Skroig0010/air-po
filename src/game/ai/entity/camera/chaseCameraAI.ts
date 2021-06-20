import { Behaviour } from '@core/behaviour/behaviour'
import { Entity } from '@core/ecs/entity'

const SPEED = 0.1

export const chaseCameraAI = function*(camera: Entity, target: Entity): Behaviour<void> {
  const cameraPos = camera.getComponent('Position')
  const targetPos = target.getComponent('Position')
  while (true) {
    cameraPos.x += (targetPos.x - cameraPos.x) * SPEED
    cameraPos.y += (targetPos.y - cameraPos.y) * SPEED
    yield
  }
}
