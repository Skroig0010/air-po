import { Behaviour } from '@core/behaviour/behaviour'
import { Entity } from '@core/ecs/entity'
import { FamilyBuilder } from '@core/ecs/family'
import { World } from '@core/ecs/world'
import { Vec2 } from '@core/math/vec2'
import { Boss1GeyserFactory } from '@game/entities/tile/boss1GeyserFactory'
import { fixedCameraAI } from '../camera/fixedCameraAI'

const CAMERA_OFFSET = new Vec2(-96, -48)
const WAKEUP_DISTANCE = 128

export const sleep = function*(boss: Entity, world: World): Behaviour<void> {
  const playerFamily = new FamilyBuilder(world).include('Player').build()
  const cameraFamily = new FamilyBuilder(world).include('Camera').build()
  while (true) {
    const [player] = playerFamily.entityArray
    const playerPos = player.getComponent('Position')
    const bossPos = boss.getComponent('Position')
    if (playerPos.sub(bossPos).length() < WAKEUP_DISTANCE) {
      const [cameraEntity] = cameraFamily.entityArray
      const camera = cameraEntity.getComponent('Camera')
      camera.aiStack.push(
        fixedCameraAI(
          cameraEntity,
          bossPos.add(CAMERA_OFFSET),
          (): boolean => boss.getComponent('HP').hp <= 0
        )
      )
      return
    }
    yield
  }
}
