import { World } from '@core/ecs/world'
import { application, windowSize } from '@core/application'
import { Container, Graphics } from 'pixi.js'
import DrawSystem from '@game/systems/drawSystem'
import CameraSystem from '@game/systems/cameraSystem'
import { ControlSystem } from '@game/systems/controlSystem'
import { MapBuilder } from '@game/map/mapBuilder'
import map from '@res/map/stage1_map1.json'
import { titleWorldAI } from '@game/ai/world/title/titleWorldAI'

export class TitleWorldFactory {
  public create(): World {
    const world = new World(titleWorldAI)

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
      new ControlSystem(world)
    )

    const mapBuilder = new MapBuilder(world)
    mapBuilder.build(map, 0)

    return world
  }
}
