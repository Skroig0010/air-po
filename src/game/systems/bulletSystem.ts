import { System } from '@core/ecs/system'
import { Entity } from '@core/ecs/entity'
import { Family, FamilyBuilder } from '@core/ecs/family'
import { World } from '@core/ecs/world'
import { CollisionCallbackArgs } from '@game/components/colliderComponent'

export class BulletSystem extends System {
  private family: Family

  public constructor(world: World) {
    super(world)

    this.family = new FamilyBuilder(world).include('Bullet', 'Collider', 'Position').build()
    this.family.entityAddedEvent.addObserver(entity => this.entityAdded(entity))
  }

  private entityAdded(entity: Entity): void {
    const collider = entity.getComponent('Collider')
    if (collider) {
      for (const c of collider.colliders) {
        if (c.tag.has('bulletBody')) {
          c.callbacks.add((args: CollisionCallbackArgs) => this.bulletCollisionCallback(args))
        }
      }
    }
  }

  public update(): void {
    for (const entity of this.family.entityIterator) {
      const bullet = entity.getComponent('Bullet')

      if (bullet.life-- < 0) {
        this.world.removeEntity(entity)
      }
    }
  }

  private bulletCollisionCallback(args: CollisionCallbackArgs): void {
    const {
      me: { entity: bullet },
    } = args
    if (bullet.hasComponent('Bullet')) {
      this.world.removeEntity(bullet)
    }
  }
}
