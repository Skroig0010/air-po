import { windowSize } from '@core/application'
import { Behaviour } from '@core/behaviour/behaviour'
import { parallelAny } from '@core/behaviour/composite'
import { ease } from '@core/behaviour/easing/easing'
import { In, Out } from '@core/behaviour/easing/functions'
import { ButtonFactory } from '@game/entities/ui/buttonFactory'
import { KeyController } from '@game/systems/controlSystem'
import { PauseWorldFactory } from '@game/worlds/pauseWorldFactory'

export const pauseFlow = function*(): Behaviour<void> {
  let hasResumeButtonPressed = false

  const { world, alphaFilter } = new PauseWorldFactory().create()

  const button1 = new ButtonFactory()
    .setPosition(windowSize.width / 2, windowSize.height / 2 - 50)
    .onClick(() => {
      hasResumeButtonPressed = true
    })
    .create()
  world.addEntity(button1)

  const button2 = new ButtonFactory()
    .setPosition(windowSize.width / 2, windowSize.height / 2)
    .create()
  world.addEntity(button2)

  const button3 = new ButtonFactory()
    .setPosition(windowSize.width / 2, windowSize.height / 2 + 50)
    .create()
  world.addEntity(button3)

  yield* parallelAny([
    (function*(): Generator<void> {
      yield* ease(Out.quad)(
        10,
        (value: number) => {
          alphaFilter.alpha = value
        },
        {
          from: 0,
          to: 1,
        }
      )

      while (!KeyController.isActionPressed('Pause') && !hasResumeButtonPressed) yield

      yield* ease(In.quad)(
        10,
        (value: number) => {
          alphaFilter.alpha = value
        },
        {
          from: 1,
          to: 0,
        }
      )
    })(),
    world.execute(),
  ])
  world.end()
}
