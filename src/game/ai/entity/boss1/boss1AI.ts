import { Behaviour } from '@core/behaviour/behaviour'
import { parallelAll } from '@core/behaviour/composite'
import { suspendable } from '@core/behaviour/suspendable'
import { Entity } from '@core/ecs/entity'
import { World } from '@core/ecs/world'
import { Vec2 } from '@core/math/vec2'
import { kill } from '../common/action/kill'
import { isAlive } from '../common/condition/isAlive'
import { attack } from './attack'
import { sleep } from './sleep'
import { stem, StemState } from './stem'
import { wakeup } from './wakeup'

const boss1Move = function*(state: StemState, boss: Entity, world: World): Behaviour<void> {
  yield* sleep(boss, world)
  // yield* wakeup(state)
  yield* attack(state, boss, world)
}

export const boss1AI = function*(boss: Entity, world: World): Behaviour<void> {
  const state = { stem: () => new Vec2(), arms: [() => new Vec2(), () => new Vec2()] }
  yield* suspendable(isAlive(boss), parallelAll([stem(state, boss), boss1Move(state, boss, world)]))
  // yield* animate(entity, 'Dying')
  yield* kill(boss, world)
}
