import { Behaviour } from '@core/behaviour/behaviour'
import { wait } from '@core/behaviour/wait'
import { FamilyBuilder } from '@core/ecs/family'
import { World } from '@core/ecs/world'
import { KeyController } from '@game/systems/controlSystem'
import { PauseWorldFactory } from '@game/worlds/pauseWorldFactory'
import { TitleWorldFactory } from '@game/worlds/titleWorldFactory'
import { isPlayerAlive } from '../common/condition/isPlayerAlive'

export const gameWorldAI = function*(world: World): Behaviour<void> {
  const playerFamily = new FamilyBuilder(world).include('Player').build()
  const isGameOn = isPlayerAlive(playerFamily)
  const shouldPause = (): boolean => KeyController.isActionPressed('Pause')

  while (isGameOn()) {
    if (shouldPause()) {
      const pauseWorld = new PauseWorldFactory().create(world)
      pauseWorld.start()
      world.pause()
    }
    yield
  }

  yield* wait(60)
  const titleWorld = new TitleWorldFactory().create()
  titleWorld.start()
  return
}
