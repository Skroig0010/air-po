import { Behaviour } from '@core/behaviour/behaviour'
import { Entity } from '@core/ecs/entity'

export const cameraAI = function*(cameraEntity: Entity): Behaviour<void> {
  const camera = cameraEntity.getComponent('Camera')
  while (true) {
    if (camera.aiStack.length > 0) {
      const topAI = camera.aiStack[camera.aiStack.length - 1]
      if (topAI.next(cameraEntity).done) {
        camera.aiStack.pop()
      }
    }
    yield
  }
}
