import { Vec2 } from '@core/math/vec2'

export const spline = (points: Array<Vec2>, s: number): ((t: number) => Vec2) => {
  const l = points.length
  const x = (i: number): Vec2 => points[i]
  const v = (i: number): Vec2 => {
    if (i === 0)
      return points[1]
        .sub(points[0])
        .normalize()
        .mul(s)
    if (i === l - 1)
      return points[l - 1]
        .sub(points[l - 2])
        .normalize()
        .mul(s)
    const v0 = points[i].sub(points[i - 1]).normalize()
    const v1 = points[i + 1].sub(points[i]).normalize()
    return v0
      .add(v1)
      .normalize()
      .mul(s)
  }
  const mul = (cs: Array<number>, vs: Array<Vec2>): Vec2 => {
    let r = new Vec2()
    for (let i = 0; i < cs.length; i++) {
      r = r.add(vs[i].mul(cs[i]))
    }
    return r
  }
  const f = (i: number): ((t: number) => Vec2) => (t: number): Vec2 => {
    const p = [x(i + 1), x(i), v(i + 1), v(i)]
    const a = mul([-2, +2, +1, +1], p)
    const b = mul([+3, -3, -1, -2], p)
    const c = mul([0, 0, 0, 1], p)
    const d = mul([0, 1, 0, 0], p)
    const t2 = t * t
    const t3 = t * t2
    return mul([t3, t2, t, 1], [a, b, c, d])
  }
  return (t: number): Vec2 => {
    const i = Math.min(Math.floor(t * (l - 1)), l - 2)
    return f(i)(t * (l - 1) - i)
  }
}
