import { World } from '@core/ecs/world'
import { application, windowSize } from '@core/application'
import { Container, Graphics } from 'pixi.js'
import DrawSystem from '@game/systems/drawSystem'
import CameraSystem from '@game/systems/cameraSystem'
import { ControlSystem } from '@game/systems/controlSystem'
import { MapBuilder } from '@game/map/mapBuilder'
import map from '@res/map/teststage.json'
import { titleWorldAI } from '@game/ai/world/title/titleWorldAI'

export class TitleWorldFactory {
  public create(): World {
    const gameWorldContainer = new Container()

    const drawContainer = new Container()
    drawContainer.filterArea = application.screen
    gameWorldContainer.addChild(drawContainer)

    const background = new Graphics()
    background.beginFill(0xc0c0c0)
    background.drawRect(0, 0, windowSize.width, windowSize.height)
    background.endFill()
    drawContainer.addChild(background)

    const world = new World(titleWorldAI)
    world.stage.addChild(gameWorldContainer)

    world.addSystem(
      new DrawSystem(world, drawContainer),
      new CameraSystem(world, drawContainer, background),
      new ControlSystem(world)
    )

    const mapBuilder = new MapBuilder(world)
    mapBuilder.build(map, 0)

    return world
  }
}