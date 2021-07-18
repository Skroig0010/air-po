import { windowSize } from '@core/application'
import { Behaviour } from '@core/behaviour/behaviour'
import { chain } from '@core/behaviour/composite'
import { ease } from '@core/behaviour/easing/easing'
import { In } from '@core/behaviour/easing/functions'
import { wait } from '@core/behaviour/wait'
import { World } from '@core/ecs/world'
import { TextFactory } from '@game/entities/textFactory'
import { BitmapText } from 'pixi.js'

export const Text = (world: World, text: string): Behaviour<void> => {
  const entity = new TextFactory({
    text,
    fontSize: 16,
  }).create()
  world.addEntity(entity)

  const [t] = entity.getComponent('Draw').children as [BitmapText]
  entity.getComponent('Position').x = windowSize.width / 2 - t.width / 2
  entity.getComponent('Position').y = windowSize.height / 2

  return chain([
    ease(In.linear)(
      5 * text.length,
      (value: number) => {
        t.text = text.substring(0, Math.floor(value))
        t.updateText()
      },
      {
        from: 0,
        to: text.length,
      }
    ),
    wait(60),
    ease(In.linear)(
      120,
      (value: number) => {
        t.alpha = value
      },
      {
        from: 1,
        to: 0,
      }
    ),
  ])
}
