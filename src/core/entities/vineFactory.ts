import { Entity } from '../ecs/entity'
import { EntityFactory } from './entityFactory'
import { PositionComponent } from '../components/positionComponent'
import { RigidBodyComponent } from '../components/rigidBodyComponent'
import { DrawComponent } from '../components/drawComponent'
import { ColliderComponent, AABBDef } from '../components/colliderComponent'
import { Vec2 } from '../math/vec2'
import { CategoryList } from './category'
import { Sprite } from 'pixi.js'
import { wallBaseTextures } from '../graphics/art'
import { VineComponent } from '../components/vineComponent'
import { BehaviourTree } from '../ai/behaviourTree'
import { ExtendVineNode } from '../ai/action/extendVineNode'
import { AIComponent } from '../components/aiComponent'
import { TrueNode } from '../ai/condition/boolNode'
import { WhileNode } from '../ai/decorator/whileNode'

export class VineFactory extends EntityFactory {
  readonly INV_MASS = 0
  readonly RESTITUTION = 0
  readonly WIDTH = 16
  readonly HEIGHT = 16

  public parent: Entity | undefined = undefined
  public create(): Entity {
    const entity = new Entity()
    const position = new PositionComponent()
    const draw = new DrawComponent()

    const aabb = new AABBDef(new Vec2(this.WIDTH, this.HEIGHT))
    aabb.tag.add('vine')
    aabb.category = CategoryList.vine.category
    aabb.mask = CategoryList.vine.mask
    const collider = new ColliderComponent(entity)
    collider.createCollider(aabb)

    const aabbSensor = new AABBDef(new Vec2(this.WIDTH, this.HEIGHT))
    aabbSensor.offset = new Vec2(0, 16)
    aabbSensor.tag.add('vineSensor')
    aabbSensor.category = CategoryList.vine.category
    aabbSensor.mask = CategoryList.vine.mask
    aabbSensor.isSensor = true
    collider.createCollider(aabbSensor)

    const body = new RigidBodyComponent(0, new Vec2(), new Vec2(), this.RESTITUTION, 0)
    body.invMass = this.INV_MASS

    if (this.parent) {
      this.parent.getComponent('Vine').child = entity
    }

    const vine = new VineComponent(this.parent, 3)

    entity.addComponent('Collider', collider)

    const vai = new BehaviourTree(new WhileNode(new TrueNode(), new ExtendVineNode(entity)))
    const ai = new AIComponent(vai)

    entity.addComponent('AI', ai)
    entity.addComponent('RigidBody', body)
    entity.addComponent('Position', position)
    entity.addComponent('Draw', draw)
    entity.addComponent('Vine', vine)

    const sprite = new Sprite(wallBaseTextures[0])
    draw.addChild(sprite)
    return entity
  }
}