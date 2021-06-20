import { windowSize } from '@core/application'
import { Behaviour } from '@core/behaviour/behaviour'
import { parallelAll } from '@core/behaviour/composite'
import { ease } from '@core/behaviour/easing/easing'
import { In, Out } from '@core/behaviour/easing/functions'
import { Ray } from '@core/collision/geometry/ray'
import { Entity } from '@core/ecs/entity'
import { FamilyBuilder } from '@core/ecs/family'
import { World } from '@core/ecs/world'
import { Vec2 } from '@core/math/vec2'
import { LaserSightLockFactory } from '@game/entities/laserSightLockFactory'
import { MouseController } from '@game/systems/controlSystem'
import { assert } from '@utils/assertion'
import { Graphics } from 'pixi.js'
import { RayHitResult, raySearchGenerator } from '../raySearcher/raySearcherAI'

type Lock = { lock: Entity; despawn: () => void }
type LockingAimState = {
  state: 'Locking'
  target: Entity
  chasing: number
  hitResult: RayHitResult
}
type FreeAimState = {
  state: 'Free'
  hitResult: RayHitResult
}
type LaserSightState = LockingAimState | FreeAimState

const updateInvisibleRay = function*(laser: Entity, world: World): Behaviour<void> {
  const playerFamily = new FamilyBuilder(world).include('Player').build()
  const cameraFamily = new FamilyBuilder(world).include('Camera').build()
  const [collider] = laser.getComponent('Collider').colliders
  while (true) {
    const [player] = playerFamily.entityArray
    const [camera] = cameraFamily.entityArray
    const mousePosition = MouseController.position
    const ray = collider.geometry as Ray
    const playerPosition = player.getComponent('Position')
    const cameraPosition = camera.getComponent('Position')
    const mousePositionOnScreen = mousePosition.sub(
      new Vec2(windowSize.width / 2, windowSize.height / 2)
    )
    const mousePositionOnWorld = cameraPosition.add(mousePositionOnScreen)

    ray.origin = playerPosition
    ray.end = mousePositionOnWorld
    yield
  }
}

const isDistantEnough = (ray: Ray, entity: Entity): boolean => {
  return ray.distance(entity.getComponent('Position')) > 20
}
const shouldLockEntity = (entity: Entity): boolean => {
  const isEntityAlive = entity.hasComponent('HP') && entity.getComponent('HP').hp > 0
  const isEntityCloseEnough = entity.getComponent('Draw').visible
  const forceFreeAiming = MouseController.isMousePressing('Right')

  return isEntityAlive && isEntityCloseEnough && !forceFreeAiming
}
const spawnLock = (target: Entity, world: World): Lock => {
  let despawning = false
  const lock = new LaserSightLockFactory(target, () => despawning, world).create()
  world.addEntity(lock)
  return {
    lock,
    despawn: (): void => {
      despawning = true
    },
  }
}

const getLaserSightStateGenerator = function*(
  player: Entity,
  laser: Entity,
  world: World
): Generator<LaserSightState, void> {
  const getClosestHit = raySearchGenerator(laser, { ignoreEntity: player, maximumDistance: 300 })
  const [collider] = laser.getComponent('Collider').colliders
  const ray = collider.geometry as Ray

  const freeAimGenerator = function*(state: FreeAimState): Behaviour<void> {
    while (true) {
      const { entity } = state.hitResult
      if (entity && shouldLockEntity(entity)) return

      yield
    }
  }

  const lockingAimGenerator = function*(entity: Entity, state: LockingAimState): Behaviour<void> {
    while (true) {
      const { entity: currentHittingEntity } = state.hitResult
      if (
        currentHittingEntity?.id !== entity.id && // 当たっているEntityが変わっていなければロックし続ける
        (isDistantEnough(ray, entity) || !shouldLockEntity(entity))
      ) {
        return
      }

      yield
    }
  }
  const lockingAimWithEasingGenerator = function*(
    entity: Entity,
    state: LockingAimState
  ): Behaviour<void> {
    const easeOutChase = ease(Out.quad)(
      6,
      value => {
        state.chasing = value
      },
      {
        from: 0,
        to: 1,
      }
    )
    const easeInChase = ease(In.quad)(
      6,
      value => {
        state.chasing = value
      },
      {
        from: 1,
        to: 0,
      }
    )

    yield* easeOutChase
    yield* lockingAimGenerator(entity, state)
    yield* easeInChase
  }

  const hitResult: RayHitResult = {
    point: new Vec2(),
  }
  const assignHitResult = (): void => {
    const { value } = getClosestHit.next()
    assert(value instanceof Object, 'Unexpected Error')

    hitResult.entity = value.entity
    hitResult.point = value.point
  }

  while (true) {
    const freeAimState: FreeAimState = {
      state: 'Free',
      hitResult,
    }
    for (const _ of freeAimGenerator(freeAimState)) {
      assignHitResult()

      yield freeAimState
    }

    const { entity } = hitResult
    assert(entity, 'Unexpected Error')

    const lockingAimState: LockingAimState = {
      state: 'Locking',
      target: entity,
      chasing: 0,
      hitResult,
    }
    const lock = spawnLock(entity, world)

    for (const _ of lockingAimWithEasingGenerator(entity, lockingAimState)) {
      assignHitResult()

      yield lockingAimState
    }

    lock.despawn()
  }
}

const updateVisibleRay = function*(laser: Entity, world: World): Behaviour<void> {
  const playerFamily = new FamilyBuilder(world).include('Player').build()
  const [g] = laser.getComponent('Draw').children as [Graphics]
  const [player] = playerFamily.entityArray

  for (const state of getLaserSightStateGenerator(player, laser, world)) {
    const start = player.getComponent('Position')

    const end = state.hitResult.point.copy()
    if (state.state === 'Locking') {
      const end1 = state.target.getComponent('Position')

      end.assign(end.add(end1.sub(end).mul(state.chasing)))
    }

    player.getComponent('Player').targetPosition = end

    g.clear()
    g.lineStyle(1, 0xff0000, undefined, undefined, true)
    g.moveTo(start.x, start.y)
    g.lineTo(end.x, end.y)
    g.beginFill(0xff0000)
    g.drawCircle(end.x, end.y, 2)

    yield
  }
}

export const laserSightAI = (laser: Entity, world: World): Behaviour<void> => {
  return parallelAll([updateInvisibleRay(laser, world), updateVisibleRay(laser, world)])
}
