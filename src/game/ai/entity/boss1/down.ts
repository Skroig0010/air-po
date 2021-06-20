import { Behaviour } from '@core/behaviour/behaviour'
import { Entity } from '@core/ecs/entity'
import { FamilyBuilder } from '@core/ecs/family'
import { World } from '@core/ecs/world'
import { Vec2 } from '@core/math/vec2'
import { shakeCameraAI } from '../camera/shakeCameraAI'
import { spline } from './spline'
import { StemShape, StemState, transiteShape } from './stem'

export const down = function*(state: StemState, boss: Entity, world: World): Behaviour<void> {
  const [camera] = new FamilyBuilder(world).include('Camera').build().entityArray
  const transiteStem = transiteShape(state.stem, 100)
  const transiteArmL = transiteShape(state.arms[0], 100)
  const transiteArmR = transiteShape(state.arms[1], 100)

  const spiral = (n: number, r0: number, r1: number, a0: number, a1: number): Array<Vec2> => {
    const result = []
    for (let i = 0; i < n; i++) {
      const t = i / n
      const r = r0 + (r1 - r0) * t
      const a = a0 + (a1 - a0) * t
      result.push(
        new Vec2(
          r * Math.cos(a) + r0 * Math.cos(a0) * t * 2,
          r * Math.sin(a) + r0 * Math.sin(a0) * t * 2
        )
      )
    }
    return result
  }

  const rot = (arrival: Vec2): ((t: number) => Vec2) => {
    const r = arrival.length()
    const ea = Math.atan2(arrival.y, arrival.x)
    const sa = ea + Math.PI / 2
    return (t: number): Vec2 => {
      const a = sa + (ea - sa) * Math.min(1, 4 * t * t * t - 3 * t * t)
      return new Vec2(r * Math.cos(a), r * Math.sin(a))
    }
  }
  const pikupiku = (base: (t: number) => Vec2): ((t: number) => Vec2) => {
    const f = (t: number): number => {
      t %= 1
      const I = 0.05
      const r = 0.8
      for (const s of [0.2, 0.55, 0.8]) {
        if (s <= t && t < s + I * r) {
          return (t - s) / (I * r)
        } else if (s + I * r < t && t < s + I) {
          return 1 - (t - s - I * r) / (I * (1 - r))
        }
      }
      return 0
    }
    return (t: number): Vec2 => {
      return new Vec2(base(t).x, base(t).y - 4 * f(t))
    }
  }

  for (let i = 0; i < 400; i++) {
    const t = i / 100
    const stem = spline(
      [
        rot(new Vec2(0, 0)),
        pikupiku(rot(new Vec2(-18, -36))),
        pikupiku(rot(new Vec2(-72, -18))),
        rot(new Vec2(-140, 0)),
      ].map(b => b(t)),
      50
    )
    const las = -Math.atan(20 / 30)
    const lae = las - (((1 - Math.cos(t * Math.PI * 2 * 0.1)) / 2) * 4 + 5)
    const armL = pikupiku(
      spline(
        [stem(0.3)].concat(
          spiral(20, 20, 5, las, lae).map(p => p.add(new Vec2(-30, 0).add(stem(0.3))))
        ),
        20
      )
    )
    const ras = Math.PI - Math.atan(20 / 30)
    const rae = ras - (((1 - Math.cos(t * Math.PI * 2 * 0.1)) / 2) * 4 + 5)
    const armR = pikupiku(
      spline(
        [stem(0.6)].concat(
          spiral(20, 20, 5, ras, rae).map(p => p.add(new Vec2(30, 0).add(stem(0.6))))
        ),
        20
      )
    )
    if (i === 100) {
      camera.getComponent('Camera').aiStack.push(shakeCameraAI(camera))
    }
    state.stem = transiteStem.next(stem).value as StemShape
    state.arms[0] = transiteArmL.next(armL).value as StemShape
    state.arms[1] = transiteArmR.next(armR).value as StemShape
    yield
  }
}
