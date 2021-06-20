import { Entity } from '@core/ecs/entity'
import { Vec2 } from '@core/math/vec2'
import { geyserAI } from '@game/ai/entity/boss1/geyserAI'
import { AIComponent } from '@game/components/aiComponent'
import { ColliderComponent, buildColliders } from '@game/components/colliderComponent'
import { HPComponent } from '@game/components/hpComponent'
import { RigidBodyComponent } from '@game/components/rigidBodyComponent'
import { HITBOX_TAG } from '@game/systems/damageSystem'
import { PHYSICS_TAG } from '@game/systems/physicsSystem'
import { Category, CategorySet } from '../category'
import { TileEntityFactory } from './tileEntityFactory'

export class Boss1GeyserFactory extends TileEntityFactory {
  private readonly COLLIDER = {
    type: 'AABB' as const,
    offset: new Vec2(0, 9),
    size: new Vec2(10, 13),
  }

  public create(): Entity {
    const entity = super.create()

    entity.addComponent(
      'Collider',
      new ColliderComponent(
        ...buildColliders({
          entity,
          colliders: [
            {
              geometry: this.COLLIDER,
              category: Category.TERRAIN,
              mask: new CategorySet(Category.PHYSICS),
              tag: [PHYSICS_TAG],
            },
            {
              geometry: this.COLLIDER,
              category: Category.ENEMY_HITBOX,
              tag: [HITBOX_TAG],
            },
          ],
        })
      )
    )
    entity.addComponent('RigidBody', new RigidBodyComponent())
    entity.addComponent('HP', new HPComponent(10, 10))
    entity.addComponent('AI', new AIComponent(geyserAI(entity, this.world)))
    return entity
  }
}
