import { System } from '../ecs/system'
import { World } from '../ecs/world'
import { Container } from 'pixi.js'
import { AirFilter } from '../../filters/airFilter'
import { DarknessFilter } from '../../filters/darknessFilter'
import { windowSize } from '../application'
import { Entity } from '../ecs/entity'
import { AABBDef, Collider, ColliderComponent } from '../components/colliderComponent'
import { Vec2 } from '../math/vec2'
import { Category, CategorySet } from '../entities/category'
import { Family, FamilyBuilder } from '../ecs/family'
import { PositionComponent } from '../components/positionComponent'

export class FilterSystem extends System {
  private airFilter: AirFilter
  private darknessFilter: DarknessFilter
  private lights: Array<Entity>
  private airFamily: Family
  private cameraFamily: Family
  private lightSearcher: Entity

  public constructor(world: World, container: Container) {
    super(world)

    this.airFilter = new AirFilter(world, { x: windowSize.width, y: windowSize.height })
    this.darknessFilter = new DarknessFilter({ x: windowSize.width, y: windowSize.height })
    this.lights = []
    this.airFamily = new FamilyBuilder(world).include('Air').build()
    this.cameraFamily = new FamilyBuilder(world).include('Camera').build()

    this.lightSearcher = new Entity()
    const aabbBody = new AABBDef(new Vec2(windowSize.width, windowSize.height))
    aabbBody.tag.add('screen')
    aabbBody.category = Category.SEARCH
    aabbBody.mask = new CategorySet(Category.LIGHT)
    aabbBody.isSensor = true
    const collider = new ColliderComponent(this.lightSearcher)
    collider.createCollider(aabbBody)
    collider.colliders[0].callbacks.add((me: Collider, other: Collider) => {
      if (!other.tag.has('light')) return
      this.lights.push(other.component.entity)
    })
    this.lightSearcher.addComponent('Collider', collider)
    this.lightSearcher.addComponent('Position', new PositionComponent())
    world.addEntity(this.lightSearcher)

    container.filters = [this.airFilter, this.darknessFilter]
  }

  public update(): void {
    this.updateAirFilter()
    this.updateDarknessFilter()
    this.updateSearcher()
  }

  private updateAirFilter(): void {
    const offset = this.cameraFamily.entityArray[0].getComponent('Position')
    const airs = []
    for (const entity of this.airFamily.entityIterator) {
      const air = entity.getComponent('Air')
      const position = entity.getComponent('Position')

      const radius = air.quantity

      airs.push({
        center: new PositionComponent(
          position.x - offset.x + windowSize.width / 2,
          position.y - offset.y + windowSize.height / 2
        ),
        radius,
      })
    }
    this.airFilter.airs = airs
  }

  private updateDarknessFilter(): void {
    const offset = this.cameraFamily.entityArray[0].getComponent('Position')
    this.darknessFilter.lights = this.lights.map(e => {
      const pos = e.getComponent('Position')
      const light = e.getComponent('Light')
      return {
        center: {
          x: pos.x - offset.x + windowSize.width / 2,
          y: pos.y - offset.y + windowSize.height / 2,
        },
        intensity: light.intensity,
      }
    })
    this.lights = []
  }

  private updateSearcher(): void {
    for (const camera of this.cameraFamily.entityIterator) {
      const cameraPos = camera.getComponent('Position')
      const searcherPos = this.lightSearcher.getComponent('Position')
      searcherPos.x = cameraPos.x - windowSize.width / 2
      searcherPos.y = cameraPos.y - windowSize.height / 2
    }
  }
}
