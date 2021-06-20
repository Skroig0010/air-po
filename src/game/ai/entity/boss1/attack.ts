import { Behaviour } from '@core/behaviour/behaviour'
import { Entity } from '@core/ecs/entity'
import { World } from '@core/ecs/world'
import { shot } from './shot'
import { StemState } from './stem'
import { wait } from './wait'

export const attack = function*(state: StemState, boss: Entity, world: World): Behaviour<void> {
  while (true) {
    yield* wait(state)
    yield* shot(state, boss, world)
  }
}
