import { Vec2 } from '@core/math/vec2'
import { Graphics } from 'pixi.js'
import { AABB } from './AABB'
import { GeometryForCollision } from './geometry'

export class Circle implements GeometryForCollision {
  public constructor(public position = new Vec2(), public radius = 0) {}

  public add(position: Vec2): Circle {
    return new Circle(this.position.add(position), this.radius)
  }

  public overlap(other: Circle): boolean {
    const distSq = this.radius + other.radius
    return this.position.sub(other.position).lengthSq() < distSq * distSq
  }

  public contains(point: Vec2): boolean {
    return this.position.sub(point).lengthSq() < this.radius * this.radius
  }

  public createBound(): AABB {
    return new AABB(this.position, new Vec2(this.radius, this.radius).mul(2))
  }

  get center(): Vec2 {
    return this.position
  }

  applyPosition(pos: Vec2): Circle {
    return this.add(pos)
  }

  draw(g: Graphics): void {
    g.drawCircle(this.position.x, this.position.y, this.radius)
  }
}
