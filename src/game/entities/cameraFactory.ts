import { Entity } from '@core/ecs/entity'
import { cameraAI } from '@game/ai/entity/camera/cameraAI'
import { AIComponent } from '@game/components/aiComponent'
import { CameraComponent } from '@game/components/cameraComponent'
import { PositionComponent } from '@game/components/positionComponent'
import { EntityFactory } from './entityFactory'

export class CameraFactory extends EntityFactory {
  create(): Entity {
    const entity = new Entity()
    entity.addComponent('Position', new PositionComponent())
    entity.addComponent('Camera', new CameraComponent([]))
    entity.addComponent(
      'AI',
      new AIComponent({
        behaviour: cameraAI(entity),
        name: 'Camera:AI',
        dependency: {
          before: ['Player:AI'],
        },
      })
    )
    return entity
  }
}
