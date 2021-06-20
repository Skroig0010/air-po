import { Entity } from '@core/ecs/entity'
import { Vec2 } from '@core/math/vec2'
import { AIComponent } from '@game/components/aiComponent'
import { ColliderComponent, buildColliders } from '@game/components/colliderComponent'
import { HPComponent } from '@game/components/hpComponent'
import { HITBOX_TAG } from '@game/systems/damageSystem'
import { Category, CategorySet } from '../category'
import { TileEntityFactory } from './tileEntityFactory'
import { boss1AI } from '@game/ai/entity/boss1/boss1AI'
import { RigidBodyComponent } from '@game/components/rigidBodyComponent'
import { PHYSICS_TAG } from '@game/systems/physicsSystem'
import { InvincibleComponent } from '@game/components/invincibleComponent'

export class Boss1Factory extends TileEntityFactory {
  private readonly BODY_COLLIDER = {
    type: 'AABB' as const,
    size: new Vec2(96, 96),
  }

  private readonly ROOT_COLLIDER = {
    type: 'AABB' as const,
    offset: new Vec2(0, 50),
    size: new Vec2(8, 0),
  }

  private readonly RIGID_BODY = {
    mass: 10,
    gravityScale: 1,
  }

  public create(): Entity {
    const entity = super.create()

    entity.addComponent('AI', new AIComponent(boss1AI(entity, this.world)))
    entity.addComponent('RigidBody', new RigidBodyComponent(this.RIGID_BODY))
    entity.addComponent('Invincible', new InvincibleComponent())
    entity.addComponent(
      'Collider',
      new ColliderComponent(
        ...buildColliders({
          entity,
          colliders: [
            {
              geometry: this.BODY_COLLIDER,
              category: Category.ENEMY_HITBOX,
              tag: [HITBOX_TAG],
            },
            {
              geometry: this.ROOT_COLLIDER,
              category: Category.PHYSICS,
              mask: new CategorySet(Category.TERRAIN),
              tag: [PHYSICS_TAG],
            },
          ],
        })
      )
    )
    entity.addComponent('HP', new HPComponent(10, 10))
    return entity
  }
}
