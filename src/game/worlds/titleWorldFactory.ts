import { World } from '@core/ecs/world'
import { application, windowSize } from '@core/application'
import { Container, Graphics } from 'pixi.js'
import DrawSystem from '@game/systems/drawSystem'
import CameraSystem from '@game/systems/cameraSystem'
import { ControlSystem } from '@game/systems/controlSystem'
import { loadStage } from '@game/stage/stageLoader'
import BackgroundSystem from '@game/systems/backgroundSystem'

export class TitleWorldFactory {
  public create(): World {
    const world = new World()

    const cameraContainer = new Container()

    const worldContainer = new Container()
    worldContainer.filterArea = application.screen

    const background = new Graphics()
    background.beginFill(0xc0c0c0)
    background.drawRect(0, 0, windowSize.width, windowSize.height)
    background.endFill()

    const uiContainer = new Container()
    uiContainer.zIndex = Infinity

    const worldUIContainer = new Container()
    worldUIContainer.zIndex = Infinity

    world.stage.addChild(background)
    world.stage.addChild(cameraContainer)
    world.stage.addChild(uiContainer)

    cameraContainer.addChild(worldUIContainer)
    cameraContainer.addChild(worldContainer)

    world.addSystem(
      new DrawSystem(world, worldContainer, worldUIContainer, uiContainer),
      new CameraSystem(world, cameraContainer),
      new ControlSystem(world),
      new BackgroundSystem(world)
    )

    const stage = loadStage('root', world)
    stage.spawnPlayer(0)

    return world
  }
}
