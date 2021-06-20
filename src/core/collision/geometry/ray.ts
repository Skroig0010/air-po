import { AABB } from './AABB'
import { Vec2 } from '@core/math/vec2'
import { GeometryForCollision } from './geometry'
import { Graphics } from 'pixi.js'
import { INFINITY_COORDINATE } from '@core/math/constants'

export class Ray implements GeometryForCollision {
  public constructor(public origin = new Vec2(), public direction = new Vec2()) {}

  createBound(): AABB {
    return new AABB(new Vec2(), new Vec2(INFINITY_COORDINATE, INFINITY_COORDINATE))
  }

  applyPosition(pos: Vec2): GeometryForCollision {
    return new Ray(pos.add(this.origin), this.direction)
  }

  draw(_: Graphics): void {}

  distance(p: Vec2): number {
    const s = this.origin
    const v = this.direction
    // <s + vt - p, v> = 0
    // t = <p - s, v> / <v, v>
    const t = Math.max(0, p.sub(s).dot(v) / v.dot(v))
    return s
      .add(v.mul(t))
      .sub(p)
      .length()
  }

  set end(e: Vec2) {
    this.direction = e.sub(this.origin)
  }
}
