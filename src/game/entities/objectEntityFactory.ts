import { Entity } from '@core/ecs/entity'
import { World } from '@core/ecs/world'
import { PositionComponent } from '@game/components/positionComponent'
import { calcCenter, StageObject } from '@game/stage/object'
import { EntityFactory } from './entityFactory'
import { EntityName, loadEntity } from './loader/EntityLoader'

export class ObjectEntityFactory extends EntityFactory {
  constructor(private name: EntityName, protected object: StageObject, protected world: World) {
    super()
  }

  create(): Entity {
    const entity = loadEntity(this.name)
    const pos = calcCenter(this.object)
    entity.addComponent('Position', new PositionComponent(pos.x, pos.y))
    return entity
  }
}
