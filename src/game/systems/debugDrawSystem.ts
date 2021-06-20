import { System } from '@core/ecs/system'
import { FamilyBuilder, Family } from '@core/ecs/family'
import { World } from '@core/ecs/world'
import { Graphics, Container } from 'pixi.js'
import { windowSize } from '@core/application'
import { AABB } from '@core/collision/geometry/AABB'
import { Vec2 } from '@core/math/vec2'
import { BVHLeaf, BVHNode } from '@core/collision/bvh'
import CollisionSystem from './collisionSystem'

export default class DebugDrawSystem extends System {
  private state = {
    position: false,
    collider: true,
    bvh: false,
  }

  private positionFamily: Family
  private colliderFamily: Family
  private cameraFamily: Family

  private collisionSystem: CollisionSystem
  private graphics: Graphics = new Graphics()

  public constructor(world: World, container: Container, collisionSystem: CollisionSystem) {
    super(world)

    this.positionFamily = new FamilyBuilder(world).include('Position').build()
    this.colliderFamily = new FamilyBuilder(world).include('Position', 'Collider').build()
    this.cameraFamily = new FamilyBuilder(world).include('Camera').build()

    this.collisionSystem = collisionSystem

    container.addChild(this.graphics)
  }

  public update(): void {
    this.graphics.clear()

    // 表示領域のみ描画して最適化
    if (this.cameraFamily.entityArray.length === 0) return
    const [camera] = this.cameraFamily.entityArray
    const cameraPosition = camera.getComponent('Position')
    const cameraX = cameraPosition.x
    const cameraY = cameraPosition.y
    const cameraW = windowSize.width
    const cameraH = windowSize.height
    const cameraArea = new AABB(new Vec2(cameraX, cameraY), new Vec2(cameraW, cameraH))

    if (this.state.position) {
      this.graphics.beginFill(0xff0000)
      for (const entity of this.positionFamily.entityIterator) {
        const position = entity.getComponent('Position')
        if (cameraArea.contains(position)) {
          this.graphics.drawRect(position.x - 1, position.y - 1, 2, 2)
        }
      }
      this.graphics.endFill()
    }

    if (this.state.collider) {
      this.graphics.lineStyle(1, 0x0000ff, 1, 0.5, true)
      for (const entity of this.colliderFamily.entityIterator) {
        const position = entity.getComponent('Position')
        const collider = entity.getComponent('Collider')

        for (const c of collider.colliders) {
          const g = c.bound.applyPosition(position)
          if (cameraArea.overlap(g)) {
            g.draw(this.graphics)
          }
        }
      }
      this.graphics.endFill()
    }

    if (this.state.bvh) {
      for (const bvh of this.collisionSystem.bvhs) {
        // webGLの頂点数上限に引っかからないようにnative: trueにしている
        this.graphics.lineStyle(1, 0xff0000, 1, 0.5, true)

        const draw = (n: BVHNode | BVHLeaf): void => {
          const g = n.bound
          if (cameraArea.overlap(g)) {
            g.draw(this.graphics)
          }
          if (n instanceof BVHNode) {
            for (const c of n.child) draw(c)
          }
        }

        if (bvh.root) draw(bvh.root)
        this.graphics.endFill()
      }
    }
  }
}
