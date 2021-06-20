import { Behaviour } from '@core/behaviour/behaviour'
import { AABB } from '@core/collision/geometry/AABB'
import { Entity } from '@core/ecs/entity'
import { Vec2 } from '@core/math/vec2'
import * as PIXI from 'pixi.js'

export type StemShape = (t: number) => Vec2

export type StemState = {
  stem: StemShape
  arms: Array<StemShape>
}

export const composite = (a: StemShape, b: StemShape, s: number): ((t: number) => Vec2) => (
  t: number
): Vec2 =>
  a(t)
    .mul(1 - s)
    .add(b(t).mul(s))

export const transiteShape = function*(
  shape: StemShape,
  duration: number
): Generator<StemShape, void, StemShape> {
  let currentShape = shape
  for (let i = 0; i < duration; i++) {
    const nextShape = yield currentShape
    const t = i / duration
    currentShape = composite(shape, nextShape, t * t * (3 - 2 * t))
  }
  while (true) {
    currentShape = yield currentShape
  }
}

const addStem = (boss: Entity, width: number): Array<PIXI.Point> => {
  const points = new Array<PIXI.Point>(100)
  for (let i = 0; i < points.length; i++) points[i] = new PIXI.Point(0, i * 2)

  const stem = new PIXI.SimpleRope(PIXI.Texture.WHITE, points, width)
  stem.tint = 0x22aa22
  stem.zIndex = -1
  boss.getComponent('Draw').addChild(stem)
  return points
}

export const stem = function*(state: StemState, boss: Entity): Behaviour<void> {
  const bossPosition = boss.getComponent('Position')
  const [_, rootCollider] = boss.getComponent('Collider').colliders
  const root = rootCollider.geometry as AABB

  boss.getComponent('Draw').sortableChildren = true
  const stemPoints = addStem(boss, 0.4)
  const armPointsList = state.arms.map(_ => addStem(boss, 0.2))

  while (true) {
    const { stem } = state
    bossPosition.x += root.center.x + stem(1).x
    bossPosition.y += root.center.y + stem(1).y
    root.center.x = -stem(1).x
    root.center.y = -stem(1).y
    for (let i = 0; i < stemPoints.length; i++) {
      const t = i / (stemPoints.length - 1)
      stemPoints[i].x = root.center.x + stem(t).x
      stemPoints[i].y = root.center.y + stem(t).y
    }
    for (let i = 0; i < armPointsList.length; i++) {
      const arm = state.arms[i]
      const armPoints = armPointsList[i]
      for (let j = 0; j < armPoints.length; j++) {
        const t = j / (armPoints.length - 1)
        armPoints[j].x = root.center.x + arm(t).x
        armPoints[j].y = root.center.y + arm(t).y
      }
    }
    yield
  }
}
