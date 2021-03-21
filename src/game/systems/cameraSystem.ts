import { System } from '@core/ecs/system'
import { World } from '@core/ecs/world'
import { windowSize } from '@core/application'
import { Container } from 'pixi.js'
import { Family, FamilyBuilder } from '@core/ecs/family'

export default class CameraSystem extends System {
  private target: Container

  private cameraFamily: Family

  public constructor(world: World, target: Container) {
    super(world)
    this.target = target

    this.cameraFamily = new FamilyBuilder(world).include('Camera').build()
    const [camera] = this.cameraFamily.entityArray
    this.updateProcess.dependencies?.push(camera.getComponent('AI').proc.name ?? '')
  }

  public update(): void {
    for (const camera of this.cameraFamily.entityIterator) {
      const position = camera.getComponent('Position')
      const offsetX = windowSize.width / 2 - position.x
      const offsetY = windowSize.height / 2 - position.y
      this.target.position.set(+offsetX, +offsetY)
    }
  }
}
