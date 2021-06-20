import { Behaviour } from '@core/behaviour/behaviour'
import { suspendable } from '@core/behaviour/suspendable'
import { Entity } from '@core/ecs/entity'
import { World } from '@core/ecs/world'
import { animate } from '../common/action/animate'
import { kill } from '../common/action/kill'
import { isAlive } from '../common/condition/isAlive'

export const geyserAI = function*(geyser: Entity, world: World): Behaviour<void> {
  yield* suspendable(isAlive(geyser), animate({ entity: geyser, loopCount: Infinity }))
  yield* kill(geyser, world)
}
