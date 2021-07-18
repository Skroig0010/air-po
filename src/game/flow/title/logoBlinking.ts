import { Behaviour } from '@core/behaviour/behaviour'
import { InOut, In } from '@core/behaviour/easing/functions'
import { stream } from '@core/behaviour/easing/stream'
import { Sprite } from 'pixi.js'

export const LogoBlinking = (logo: Sprite): Behaviour<void> =>
  stream(
    (value: number) => {
      logo.alpha = value
    },
    1,
    [
      {
        easing: InOut.sine,
        duration: 3,
        to: 0,
      },
      {
        easing: InOut.sine,
        duration: 3,
        to: 1,
      },
      {
        easing: InOut.sine,
        duration: 3,
        to: 0,
      },
      {
        easing: InOut.sine,
        duration: 3,
        to: 1,
      },
      {
        easing: In.sine,
        duration: 16,
        to: 0,
      },
    ]
  )
