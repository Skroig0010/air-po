import { World } from '@core/ecs/world'
import { ControlSystem } from '@game/systems/controlSystem'
import { pauseWorldAI } from '@game/ai/world/pause/pauseWorldAI'
import DrawSystem from '@game/systems/drawSystem'
import { Container, filters, Graphics } from 'pixi.js'
import { windowSize } from '@core/application'
import { CameraFactory } from '@game/entities/cameraFactory'

export class PauseWorldFactory {
  public create(gameWorld: World): World {
    const alphaFilter = new filters.AlphaFilter(0)

    const world = new World(pauseWorldAI(gameWorld, alphaFilter))

    const background = new Graphics()
    background.beginFill(0, 0.5)
    background.drawRect(0, 0, windowSize.width, windowSize.height)
    background.endFill()

    const rootContainer = new Container()
    rootContainer.filters = rootContainer.filters || [] // undefinedの場合は空配列を入れる
    rootContainer.filters.push(alphaFilter)
    world.stage.addChild(rootContainer)

    const worldContainer = new Container()
    rootContainer.addChild(worldContainer)

    worldContainer.addChild(background)

    const worldUIContainer = new Container()
    worldUIContainer.zIndex = Infinity
    worldContainer.addChild(worldUIContainer)

    const uiContainer = new Container()
    rootContainer.addChild(uiContainer)

    world.addSystem(
      new ControlSystem(world),
      new DrawSystem(world, worldContainer, worldUIContainer, uiContainer)
    )

    const camera = new CameraFactory().create()
    world.addEntity(camera)

    return world
  }
}
