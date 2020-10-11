import { System } from '../ecs/system'
import { Family, FamilyBuilder } from '../ecs/family'
import { World } from '../ecs/world'
import { Container } from 'pixi.js'
import { Entity } from '../ecs/entity'
import { windowSize } from '../../core/application'

export default class DrawSystem extends System {
  private family: Family
  private cameraFamily: Family

  private container: Container = new Container()

  public constructor(world: World, stage: Container) {
    super(world)

    stage.addChild(this.container)

    this.family = new FamilyBuilder(world).include('Draw').build()

    for (const entity of this.family.entityIterator) {
      this.onContainerAdded(entity)
    }
    this.family.entityAddedEvent.addObserver(entity => this.onContainerAdded(entity))
    this.family.entityRemovedEvent.addObserver(entity => this.onContainerRemoved(entity))
    this.cameraFamily = new FamilyBuilder(world).include('Camera').build()
  }

  public onContainerAdded(entity: Entity): void {
    const container = entity.getComponent('Draw')
    this.container.addChild(container)
  }

  public onContainerRemoved(entity: Entity): void {
    if (entity.hasComponent('Draw')) {
      const container = entity.getComponent('Draw')
      this.container.removeChild(container)
    }
  }

  public update(): void {
    for (const camera of this.cameraFamily.entityIterator) {
      const cpos = camera.getComponent('Position')
      for (const entity of this.family.entityIterator) {
        const container = entity.getComponent('Draw')
        if (entity.hasComponent('Position')) {
          const position = entity.getComponent('Position')
          const x = position.x - cpos.x
          const y = position.y - cpos.y
          const [w, h] = container.size
          const sw = windowSize.width
          const sh = windowSize.height
          const [cx, cy] = container.center
          const left = x - w * cx
          const right = x + w * (1 - cx)
          const top = y - h * cy
          const bottom = y + h * (1 - cy)
          container.visible = left < sw / 2 && top < sh / 2 && -sw / 2 < right && -sh / 2 < bottom
          if (container.visible) {
            container.position.set(position.x, position.y)
          }
        }
      }
    }
  }
}
