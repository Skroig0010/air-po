import { Behaviour } from '@core/behaviour/behaviour'
import { parallelAll } from '@core/behaviour/composite'
import { suspendable } from '@core/behaviour/suspendable'
import { Entity } from '@core/ecs/entity'
import { World } from '@core/ecs/world'
import { Vec2 } from '@core/math/vec2'
import { kill } from '../common/action/kill'
import { isAlive } from '../common/condition/isAlive'
import { attack } from './attack'
import { down } from './down'
import { sleep } from './sleep'
import { spawnGeyser } from './spawnGeyser'
import { stem, StemState } from './stem'

const boss1Move = function*(state: StemState, boss: Entity, world: World): Behaviour<void> {
  yield* sleep(boss, world)

  const geyserPos = boss.getComponent('Position').add(new Vec2(32, -16))
  while (true) {
    boss.getComponent('Invincible').setInvincible(Infinity)
    const geyser = yield* spawnGeyser(geyserPos, world)
    yield* suspendable(isAlive(geyser), attack(state, boss, world))
    boss.getComponent('Invincible').setInvincible(0)
    yield* down(state, boss, world)
  }
}

export const boss1AI = function*(boss: Entity, world: World): Behaviour<void> {
  const state = {
    stem: (): Vec2 => new Vec2(),
    arms: [(): Vec2 => new Vec2(), (): Vec2 => new Vec2()],
  }
  yield* suspendable(isAlive(boss), parallelAll([stem(state, boss), boss1Move(state, boss, world)]))
  yield* kill(boss, world)
}
