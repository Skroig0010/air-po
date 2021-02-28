import { EntityFactory } from './entityFactory'
import { Entity } from '@core/ecs/entity'
import { PositionComponent } from '@game/components/positionComponent'
import { RigidBodyComponent } from '@game/components/rigidBodyComponent'
import { Vec2 } from '@core/math/vec2'
import { DrawComponent } from '@game/components/drawComponent'
import { HorizontalDirectionComponent } from '@game/components/directionComponent'
import { buildColliders, ColliderComponent } from '@game/components/colliderComponent'
import { Category, CategorySet } from './category'
import { AttackComponent } from '@game/components/attackComponent'
import { HPComponent } from '@game/components/hpComponent'
import { AIComponent } from '@game/components/aiComponent'
import { parseAnimation } from '@core/graphics/animationParser'
import { AnimationStateComponent } from '@game/components/animationStateComponent'
import enemy1Definition from '@res/animation/enemy1.json'
import { World } from '@core/ecs/world'
import { enemy1AI } from '@game/ai/entity/enemy1/enemy1AI'

export class Enemy1Factory extends EntityFactory {
  private readonly BODY_COLLIDER = {
    type: 'AABB' as const,
    offset: new Vec2(0, 1),
    size: new Vec2(16, 12),
    maxClipToTolerance: new Vec2(2, 2),
  }

  private readonly HIT_BOX_COLLIDER = {
    type: 'AABB' as const,
    size: new Vec2(16, 12),
    maxClipToTolerance: new Vec2(2, 2),
  }

  private readonly RIGID_BODY = {
    mass: 10,
    gravityScale: 1,
  }

  public constructor(private world: World) {
    super()
  }

  public create(): Entity {
    const entity = new Entity()

    entity.addComponent('AI', new AIComponent(enemy1AI(entity, this.world)))
    entity.addComponent('Position', new PositionComponent())
    entity.addComponent('RigidBody', new RigidBodyComponent(this.RIGID_BODY))
    entity.addComponent(
      'Draw',
      new DrawComponent({
        entity,
        child: {
          sprite: parseAnimation(enemy1Definition.sprite),
        },
      })
    )
    entity.addComponent(
      'Collider',
      new ColliderComponent(
        ...buildColliders({
          entity,
          colliders: [
            {
              geometry: this.BODY_COLLIDER,
              category: Category.PHYSICS,
              mask: new CategorySet(Category.STATIC_WALL, Category.DYNAMIC_WALL),
              tag: ['enemy1Body'],
            },
            {
              geometry: this.BODY_COLLIDER,
              category: Category.HITBOX,
              mask: new CategorySet(Category.ATTACK, Category.SENSOR),
              tag: ['enemy1Body'],
              isSensor: true,
            },
            {
              geometry: this.HIT_BOX_COLLIDER,
              category: Category.ATTACK,
              mask: new CategorySet(Category.PLAYER_HITBOX),
              tag: ['AttackHitBox'],
              isSensor: true,
            },
          ],
        })
      )
    )
    entity.addComponent('Attack', new AttackComponent(1, false))
    entity.addComponent('HP', new HPComponent(2, 2))
    entity.addComponent('AnimationState', new AnimationStateComponent(entity))
    entity.addComponent('HorizontalDirection', new HorizontalDirectionComponent(entity, 'Right'))
    return entity
  }
}
