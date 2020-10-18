import { AABBDef, ColliderComponent } from '../components/colliderComponent'
import { PositionComponent } from '../components/positionComponent'
import { SensorComponent } from '../components/sensorComponent'
import { Entity } from '../ecs/entity'
import { Vec2 } from '../math/vec2'
import { CategoryList } from './category'
import { EntityFactory } from './entityFactory'

export class SensorFactory extends EntityFactory {
  private x = 0
  private y = 0
  private w = 0
  private h = 0
  private eventName = ''

  public create(): Entity {
    const result = new Entity()

    result.addComponent('Position', new PositionComponent(this.x + this.w / 2, this.y - this.h / 2))

    const collider = new ColliderComponent(result)
    const aabb = new AABBDef(new Vec2(this.w, this.h), CategoryList.eventSensor)
    aabb.offset = new Vec2(-this.w / 2, -this.h / 2)
    collider.createCollider(aabb)
    result.addComponent('Collider', collider)

    result.addComponent('Sensor', new SensorComponent(this.eventName))

    return result
  }

  public setPosition(x: number, y: number): SensorFactory {
    this.x = x
    this.y = y
    return this
  }

  public setSize(w: number, h: number): SensorFactory {
    this.w = w
    this.h = h
    return this
  }

  public setEventName(eventName: string): SensorFactory {
    this.eventName = eventName
    return this
  }
}
