import { Behaviour } from '@core/behaviour/behaviour'
import { Entity } from '@core/ecs/entity'

const INTERVAL = 70
const SHAKE_RADIUS = 16

export const shakeCameraAI = function*(camera: Entity): Behaviour<void> {
  const pos = camera.getComponent('Position')
  const center = pos.copy()
  for (let i = 0; i < INTERVAL; i++) {
    const t = i / INTERVAL
    const r = SHAKE_RADIUS * Math.exp(-t * Math.log(SHAKE_RADIUS))
    const a = Math.random() * Math.PI * 2
    pos.x = center.x + Math.cos(a) * r
    pos.y = center.y + Math.sin(a) * r
    yield
  }
}
