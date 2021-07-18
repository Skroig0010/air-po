import { Family } from '@core/ecs/family'
import { isAlive } from '@game/ai/entity/common/condition/isAlive'
import { assertSingle } from '@utils/assertion'

export const isPlayerAlive = (playerFamily: Family) => (): boolean => {
  assertSingle(playerFamily.entityArray.length, 'player')
  const [playerEntity] = playerFamily.entityArray
  return isAlive(playerEntity)()
}
