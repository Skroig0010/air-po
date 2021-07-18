import { parallelAll } from '@core/behaviour/composite'
import { wait } from '@core/behaviour/wait'
import { FamilyBuilder } from '@core/ecs/family'
import { KeyController } from '@game/systems/controlSystem'
import { GameWorldFactory } from '@game/worlds/gameWorldFactory'
import { FadeIn } from '../common/animation/fadeIn'
import { Text } from './text'
import { isPlayerAlive } from '../common/condition/isPlayerAlive'
import { loadStage, StageName } from '@game/stage/stageLoader'
import { suspendable } from '@core/behaviour/suspendable'
import { pauseFlow } from '../pause/pauseFlow'
import { Flow } from '../flow'
import { Entity } from '@core/ecs/entity'

export const gameFlow = function*(stageName: StageName, player?: Entity): Flow {
  const gameWorldFactory = new GameWorldFactory()
  const world = gameWorldFactory.create()
  const stage = loadStage(stageName, world)

  stage.spawnPlayer(player?.getComponent('Player').spawnerID ?? 0)
  stage.startBGM()

  const playerFamily = new FamilyBuilder(world).include('Player').build()
  const isGameOn = isPlayerAlive(playerFamily)
  const canExecute = (): boolean => !KeyController.isActionPressed('Pause')

  yield* suspendable(
    isGameOn,
    parallelAll([
      (function*(): Generator<void> {
        while (true) {
          yield* suspendable(canExecute, world.execute())
          yield* pauseFlow()
        }
      })(),
      (function*(): Generator<void> {
        yield* FadeIn(world)
        yield* Text(world, 'そうなんちてん')
      })(),
    ])
  )
  yield* wait(60)
  world.end()
  stage.stopBGM()

  const [nextPlayer] = playerFamily.entityArray
  return gameFlow(stageName, nextPlayer)
}
