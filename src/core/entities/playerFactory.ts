import { Entity } from '../ecs/entity'
import { EntityFactory } from './entityFactory'
import { PositionComponent } from '../components/positionComponent'
import { RigidBodyComponent } from '../components/rigidBodyComponent'
import { DrawComponent } from '../components/drawComponent'
import { ColliderComponent } from '../components/colliderComponent'
import { PlayerComponent } from '../components/playerComponent'
import { Vec2 } from '../math/vec2'
import { Category } from './category'
import { Graphics } from 'pixi.js'

export class PlayerFactory extends EntityFactory {
  readonly MASS = 10
  readonly RESTITUTION = 0
  readonly WIDTH = 32
  readonly HEIGHT = 30
  readonly FOOT_WIDTH = 30
  readonly FOOT_HEIGHT = 2
  readonly FOOT_OFFSET_X = 1
  readonly FOOT_OFFSET_Y = 30

  public create(): Entity {
    const entity = new Entity()
    const position = new PositionComponent(200, 100)
    const body = new RigidBodyComponent(
      this.MASS,
      new Vec2(),
      new Vec2(),
      this.RESTITUTION
    )
    const draw = new DrawComponent()
    const player = new PlayerComponent()
    const collider = new ColliderComponent(entity)
    collider.createAABB(
      new Vec2(this.WIDTH, this.HEIGHT),
      new Vec2(),
      false,
      null,
      '',
      Category.PLAYER,
      Category.WALL
    )
    collider.createAABB(
      new Vec2(this.FOOT_WIDTH, this.FOOT_HEIGHT),
      new Vec2(this.FOOT_OFFSET_X, this.FOOT_OFFSET_Y),
      false,
      null,
      'foot',
      Category.PLAYER,
      Category.WALL
    )
    const graphics = new Graphics()
    graphics.beginFill(0xffff00)
    graphics.drawRect(0, 0, this.WIDTH, this.HEIGHT)
    graphics.beginFill(0xff0000)
    graphics.drawRect(
      this.FOOT_OFFSET_X,
      this.FOOT_OFFSET_Y,
      this.FOOT_WIDTH,
      this.FOOT_HEIGHT
    )
    draw.addChild(graphics)
    entity.addComponent('Position', position)
    entity.addComponent('RigidBody', body)
    entity.addComponent('Draw', draw)
    entity.addComponent('Collider', collider)
    entity.addComponent('Player', player)
    return entity
  }
}