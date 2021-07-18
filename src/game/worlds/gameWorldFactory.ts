import { World } from '@core/ecs/world'
import DebugDrawSystem from '@game/systems/debugDrawSystem'
import { application, windowSize } from '@core/application'
import PhysicsSystem from '@game/systems/physicsSystem'
import GravitySystem from '@game/systems/gravitySystem'
import { Container } from 'pixi.js'
import DrawSystem from '@game/systems/drawSystem'
import { AirSystem } from '@game/systems/airSystem'
import CameraSystem from '@game/systems/cameraSystem'
import { ControlSystem } from '@game/systems/controlSystem'
import { BulletSystem } from '@game/systems/bulletSystem'
import AISystem from '@game/systems/aiSystem'
import InvincibleSystem from '@game/systems/invincibleSystem'
import { DamageSystem } from '@game/systems/damageSystem'
import { AirHolderSystem } from '@game/systems/airHolderSystem'
import * as PIXI from 'pixi.js'
import { FilterSystem } from '@game/systems/filterSystem'
import { LightSystem } from '@game/systems/lightSystem'
import { EventSensorSystem } from '@game/systems/eventSensorSystem'
import { HPSystem } from '@game/systems/hpSystem'
import CollisionSystem from '@game/systems/collisionSystem'
import { FilterEffectSystem } from '@game/systems/filterEffectSystem'
import BackgroundSystem from '@game/systems/backgroundSystem'
import { DamageEffectSystem } from '@game/systems/damageEffectSystem'
import SoundSystem from '@game/systems/soundSystem'

export class GameWorldFactory {
  public create(): World {
    const world = new World()

    const filterContainer = new Container()

    const cameraContainer = new Container()

    const worldContainer = new Container()
    worldContainer.filterArea = application.screen
    worldContainer.sortableChildren = true

    const background = new PIXI.Graphics()
    background.beginFill(0xc0c0c0)
    background.drawRect(0, 0, windowSize.width, windowSize.height)
    background.endFill()

    const worldUIContainer = new Container()
    worldUIContainer.zIndex = Infinity

    const debugContainer = new Container()
    debugContainer.zIndex = Infinity

    const uiContainer = new Container()
    uiContainer.zIndex = Infinity

    world.stage.addChild(filterContainer)
    world.stage.addChild(uiContainer)

    filterContainer.addChild(background)
    filterContainer.addChild(cameraContainer)

    cameraContainer.addChild(worldContainer)
    cameraContainer.addChild(worldUIContainer)
    cameraContainer.addChild(debugContainer)

    const collisionSystem = new CollisionSystem(world)
    world.addSystem(
      new GravitySystem(world),
      new PhysicsSystem(world),
      collisionSystem,
      new AISystem(world),
      new BulletSystem(world),
      new InvincibleSystem(world),
      new DamageSystem(world),
      new DamageEffectSystem(world),
      new FilterSystem(world, filterContainer),
      new FilterEffectSystem(world, world.stage),
      new AirSystem(world),
      new LightSystem(world),
      new AirHolderSystem(world),
      new DrawSystem(world, worldContainer, worldUIContainer, uiContainer),
      new DebugDrawSystem(world, debugContainer, collisionSystem),
      new CameraSystem(world, cameraContainer),
      new ControlSystem(world),
      new EventSensorSystem(world),
      new HPSystem(world, worldUIContainer),
      new BackgroundSystem(world),
      new SoundSystem(world)
    )
    return world
  }
}
