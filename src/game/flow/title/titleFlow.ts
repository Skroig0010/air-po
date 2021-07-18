import { loadPlayData, StoryStatus } from '@game/playdata/playdata'
import { MouseController } from '@game/systems/controlSystem'
import * as Sound from '@core/sound/sound'
import { LogoBlinking } from './logoBlinking'
import { assert } from '@utils/assertion'
import { FadeOut } from '../common/animation/fadeOut'
import { getSpriteBuffer } from '@core/graphics/art'
import { Sprite } from 'pixi.js'
import { StageName } from '@game/stage/stageLoader'
import { TitleWorldFactory } from '@game/worlds/titleWorldFactory'
import { parallelAny } from '@core/behaviour/composite'
import { gameFlow } from '../game/gameFlow'
import { openingFlow } from '../opening/openingFlow'
import { Flow } from '../flow'

const createNextFlow = (): Flow => {
  const playData = loadPlayData()

  switch (playData.status) {
    case StoryStatus.Opening:
      return openingFlow()
    case StoryStatus.Stage: {
      assert(playData.mapName !== undefined, 'save data is broken')
      return gameFlow(playData.mapName as StageName)
    }
  }
}

export const titleFlow = function*(): Flow {
  const world = new TitleWorldFactory().create()

  const titleImage = new Sprite(getSpriteBuffer('title').definitions['Default'].textures[0])
  world.stage.addChild(titleImage)

  yield* parallelAny([
    (function*(): Generator<void> {
      while (!MouseController.isMousePressed('Left')) yield
      Sound.play('start')
      yield* LogoBlinking(titleImage)
      yield* FadeOut(world)
    })(),
    world.execute(),
  ])
  world.end()
  return createNextFlow()
}
