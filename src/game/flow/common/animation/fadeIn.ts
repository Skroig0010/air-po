import { windowSize } from '@core/application'
import { Behaviour } from '@core/behaviour/behaviour'
import { ease } from '@core/behaviour/easing/easing'
import { In } from '@core/behaviour/easing/functions'
import { World } from '@core/ecs/world'
import { Graphics } from 'pixi.js'

export const FadeIn = (world: World): Behaviour<void> => {
  const black = new Graphics()
  black.beginFill(0)
  black.drawRect(0, 0, windowSize.width, windowSize.height)
  black.endFill()
  black.alpha = 0
  world.stage.addChild(black)

  return ease(In.linear)(
    30,
    (value: number) => {
      black.alpha = value
    },
    {
      from: 1,
      to: 0,
    }
  )
}
