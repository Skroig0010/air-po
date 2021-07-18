import { World } from '@core/ecs/world'
import { Vec2 } from '@core/math/vec2'
import { play, SoundName } from '@core/sound/sound'
import { SoundInstance } from '@core/sound/soundInstance'
import { chaseCameraAI } from '@game/ai/entity/camera/chaseCameraAI'
import { CameraFactory } from '@game/entities/cameraFactory'
import { LaserSightFactory } from '@game/entities/laserSightFactory'
import { PlayerFactory } from '@game/entities/playerFactory'
import { PlayerUIFactory } from '@game/entities/playerUIFactory'
import { assert } from '@utils/assertion'

export class Stage {
  private playerSpanwners = new Map<number, Vec2>()
  private bgmName?: SoundName
  private bgm?: SoundInstance

  public constructor(private world: World) {}

  public registerSpawner(id: number, pos: Vec2): void {
    assert(this.playerSpanwners.has(id) === false, `Multiple player spawner ID detected: ${id}`)
    this.playerSpanwners.set(id, pos)
  }

  public spawnPlayer(id: number): void {
    const pos = this.playerSpanwners.get(id)
    assert(pos, `player spawner ID '${id}' is not found`)

    const player = new PlayerFactory(pos, this.world).create()
    const camera = new CameraFactory().create()
    camera.getComponent('Camera').aiStack.push(chaseCameraAI(camera, player))
    this.world.addEntity(player)
    this.world.addEntity(new LaserSightFactory(this.world).create())
    this.world.addEntity(new PlayerUIFactory(this.world).create())
    this.world.addEntity(camera)
  }

  public setBGM(name: SoundName): void {
    this.bgmName = name
  }

  public startBGM(): void {
    if (this.bgmName !== undefined) {
      this.bgm = play(this.bgmName, { volume: 0.1, loop: true })
    }
  }

  public stopBGM(): void {
    if (this.bgm !== undefined) {
      this.bgm.stop()
    }
  }
}
