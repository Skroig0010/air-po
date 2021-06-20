import { Entity } from '@core/ecs/entity'
import { World } from '@core/ecs/world'
import { parseAnimation } from '@core/graphics/animationParser'
import { Vec2 } from '@core/math/vec2'
import { playerAI } from '@game/ai/entity/player/playerAI'
import { AIComponent } from '@game/components/aiComponent'
import { AirHolderComponent } from '@game/components/airHolderComponent'
import { AnimationStateComponent } from '@game/components/animationStateComponent'
import { Collider, ColliderComponent, buildColliders } from '@game/components/colliderComponent'
import { HorizontalDirectionComponent } from '@game/components/directionComponent'
import { DrawComponent } from '@game/components/drawComponent'
import { EquipmentComponent } from '@game/components/equipmentComponent'
import { HPComponent } from '@game/components/hpComponent'
import { InvincibleComponent } from '@game/components/invincibleComponent'
import { PlayerComponent } from '@game/components/playerComponent'
import { PositionComponent } from '@game/components/positionComponent'
import { RigidBodyComponent } from '@game/components/rigidBodyComponent'
import { AIR_HOLDER_TAG } from '@game/systems/airHolderSystem'
import { PHYSICS_TAG } from '@game/systems/physicsSystem'
import { Category, CategorySet } from '../category'
import { EntityFactory } from '../entityFactory'
import { THROUGH_FLOOR_TAG } from '../tile/throughFloorFactory'
import playerDefinition from '@res/setting/player.json'

export const PLAYER_SENSOR_TAG = 'PlayerSensor'
export const PLAYER_FOOT_TAG = 'PlayerFoot'

export class PlayerFactory extends EntityFactory {
  private readonly BODY_COLLIDER = {
    type: 'AABB' as const,
    size: new Vec2(13, 16),
    maxClipToTolerance: new Vec2(3, 4),
  }

  private readonly FOOT_COLLIDER = {
    type: 'AABB' as const,
    offset: new Vec2(0, 8),
    size: new Vec2(8, 1),
    maxClipToTolerance: new Vec2(2, 0),
  }

  private readonly RIGID_BODY = {
    mass: 10,
    gravityScale: 1,
    airResistance: 2.25,
  }

  private readonly AIR_HOLDER = {
    initialQuantity: 0,
    maxQuantity: 0,
    collectSpeed: 0.05,
    consumeSpeed: 0.025,
    shouldDamageInSuffocation: true,
  }

  constructor(private pos: Vec2, private world: World) {
    super()
  }

  public create(): Entity {
    const entity = new Entity()

    entity.addComponent('Position', new PositionComponent(this.pos.x, this.pos.y))

    entity.addComponent(
      'Draw',
      new DrawComponent({
        entity,
        child: {
          sprite: parseAnimation(playerDefinition),
        },
      })
    )

    entity.addComponent('AnimationState', new AnimationStateComponent(entity))

    const player = new PlayerComponent()
    const airHolder = new AirHolderComponent(this.AIR_HOLDER)

    const equipment = new EquipmentComponent()
    equipment.equipEvent.addObserver(type => {
      if (type === 'AirTank') {
        equipment.airTank.count += 1
        airHolder.maxQuantity += equipment.airTank.quantity
        airHolder.quantity += equipment.airTank.quantity
      }
    })
    // 初期状態で空気タンクを2つ追加しておく
    equipment.equipEvent.notify('AirTank')
    equipment.equipEvent.notify('AirTank')

    const shouldCollide = (me: Collider, other: Collider): boolean => {
      if (player.throughFloorIgnoreCount > 0 && other.tag.has(THROUGH_FLOOR_TAG)) return false
      return true
    }

    entity.addComponent(
      'AI',
      new AIComponent({
        behaviour: playerAI(entity, this.world),
        name: 'Player:AI',
        dependency: {
          before: ['ControlSystem:update'],
        },
      })
    )
    entity.addComponent('RigidBody', new RigidBodyComponent(this.RIGID_BODY))
    entity.addComponent('HP', new HPComponent(3, 3))
    entity.addComponent('Invincible', new InvincibleComponent())
    entity.addComponent(
      'Collider',
      new ColliderComponent(
        ...buildColliders({
          entity,
          colliders: [
            {
              geometry: this.BODY_COLLIDER,
              category: Category.PHYSICS,
              mask: new CategorySet(Category.TERRAIN),
              tag: [PHYSICS_TAG],
              condition: shouldCollide,
            },
            {
              geometry: this.BODY_COLLIDER,
              category: Category.PLAYER_HITBOX,
            },
            {
              geometry: this.BODY_COLLIDER,
              category: Category.AIR_HOLDER,
              mask: new CategorySet(Category.AIR),
              tag: [AIR_HOLDER_TAG],
            },
            {
              geometry: this.BODY_COLLIDER,
              category: Category.SENSOR,
              mask: new CategorySet(Category.ITEM, Category.EQUIPMENT, Category.SENSOR),
              tag: [PLAYER_SENSOR_TAG],
            },
            {
              geometry: this.FOOT_COLLIDER,
              category: Category.SENSOR,
              mask: new CategorySet(Category.TERRAIN),
              tag: [PLAYER_FOOT_TAG],
              condition: shouldCollide,
            },
          ],
        })
      )
    )
    entity.addComponent('Player', player)
    entity.addComponent('AirHolder', airHolder)
    entity.addComponent('Equipment', equipment)
    entity.addComponent('HorizontalDirection', new HorizontalDirectionComponent(entity, 'Right'))
    return entity
  }
}
