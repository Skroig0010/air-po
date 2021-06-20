import { Behaviour } from '@core/behaviour/behaviour'
import { Vec2 } from '@core/math/vec2'
import { spline } from './spline'
import { StemShape, StemState, transiteShape } from './stem'

const rot = (a: number, r: number): Vec2 => {
  return new Vec2(r * Math.cos(a), r * Math.sin(a))
}

const spiral = (n: number, r0: number, r1: number, a0: number, a1: number): Array<Vec2> => {
  const result = []
  for (let i = 0; i < n; i++) {
    const t = i / n
    const r = r0 + (r1 - r0) * t
    const a = a0 + (a1 - a0) * t
    result.push(rot(a, r))
  }
  return result
}

export const wait = function*(state: StemState): Behaviour<void> {
  const transiteStem = transiteShape(state.stem, 60)
  const transiteArmL = transiteShape(state.arms[0], 60)
  const transiteArmR = transiteShape(state.arms[1], 60)
  for (let i = 0; i < 300; i++) {
    const t = (i / 100) % 1
    const stem = spline(
      [
        new Vec2(0, 0),
        new Vec2(-8, -32).add(rot(i * 0.02, 10)),
        new Vec2(+32, -64).add(rot(i * 0.04, 15)),
        new Vec2(0, -112).add(rot(i * 0.01, 5)),
        new Vec2(-32, -96).add(rot(-i * 0.03, 20)),
      ],
      50
    )
    const las = -Math.atan(20 / 30)
    const lae = las - (((1 - Math.cos(t * Math.PI * 2)) / 2) * 4 + 5)
    const armL = spline(
      [stem(0.3)].concat(
        spiral(20, 20, 0, las, lae).map(p => p.add(new Vec2(-30, 0).add(stem(0.3))))
      ),
      20
    )
    const ras = Math.PI - Math.atan(20 / 30)
    const rae = ras - (((1 - Math.cos(t * Math.PI * 2)) / 2) * 4 + 5)
    const armR = spline(
      [stem(0.6)].concat(
        spiral(20, 20, 0, ras, rae).map(p => p.add(new Vec2(30, 0).add(stem(0.6))))
      ),
      20
    )
    state.stem = transiteStem.next(stem).value as StemShape
    state.arms[0] = transiteArmL.next(armL).value as StemShape
    state.arms[1] = transiteArmR.next(armR).value as StemShape
    yield
  }
}
