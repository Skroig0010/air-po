import { AABBDef, ColliderComponent } from '../components/colliderComponent'
import { PositionComponent } from '../components/positionComponent'
import { SensorComponent } from '../components/sensorComponent'
import { Entity } from '../ecs/entity'
import { Vec2 } from '../math/vec2'
import { CategoryList } from './category'
import { EntityFactory } from './entityFactory'

export class EventSensorFactory extends EntityFactory {
  private position = new Vec2(0, 0)
  private size = new Vec2(0, 0)
  private event = ''

  public create(): Entity {
    const result = new Entity()

    result.addComponent(
      'Position',
      new PositionComponent(this.position.x + this.size.x / 2, this.position.y - this.size.y / 2)
    )

    const collider = new ColliderComponent(result)
    const aabb = new AABBDef(new Vec2(this.size.x, this.size.y), CategoryList.eventSensor)
    aabb.offset = new Vec2(-this.size.x / 2, -this.size.y / 2)
    collider.createCollider(aabb)
    result.addComponent('Collider', collider)

    result.addComponent('Sensor', new SensorComponent(this.event))

    return result
  }

  public setPosition(x: number, y: number): EventSensorFactory {
    this.position = new Vec2(x, y)
    return this
  }

  public setSize(w: number, h: number): EventSensorFactory {
    this.size = new Vec2(w, h)
    return this
  }

  public setEvent(event: string): EventSensorFactory {
    this.event = event
    return this
  }
}
