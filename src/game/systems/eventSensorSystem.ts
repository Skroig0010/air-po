import { CollisionCallbackArgs } from '@game/components/colliderComponent'
import { Entity } from '@core/ecs/entity'
import { Family, FamilyBuilder } from '@core/ecs/family'
import { System } from '@core/ecs/system'
import { World } from '@core/ecs/world'
import { EquipmentTypes } from '@game/components/equipmentComponent'
import * as Sound from '@core/sound/sound'
import { PLAYER_SENSOR_TAG } from '@game/entities/playerFactory'
import { loadStage, StageName } from '@game/stage/stageLoader'

export class EventSensorSystem extends System {
  private sensorFamily: Family
  private playerFamily: Family

  constructor(world: World) {
    super(world)
    this.sensorFamily = new FamilyBuilder(world).include('Sensor').build()
    this.sensorFamily.entityAddedEvent.addObserver((e: Entity) => this.onSensorAdded(e))
    this.playerFamily = new FamilyBuilder(world).include('Player').build()
  }

  public update(): void {}

  private onSensorAdded(entity: Entity): void {
    const { event } = entity.getComponent('Sensor')
    for (const c of entity.getComponent('Collider').colliders) {
      c.callbacks.add(async (args: CollisionCallbackArgs) => {
        if (!args.other.tag.has(PLAYER_SENSOR_TAG)) return
        await this.fireEvent(event)
      })
    }
  }

  private async fireEvent(event: string): Promise<void> {
    const [eventName, ...options] = event.split(' ')
    switch (eventName) {
      case 'changeMap':
        await this.moveEvent(options[0] as StageName, Number(options[1]))
        break
      case 'equipItem':
        await this.equipItemEvent(options[0] as EquipmentTypes, Number(options[1]))
        break
    }
  }

  private async moveEvent(newMapName: StageName, spawnerID: number): Promise<void> {
    this.world.reset()
    const stage = loadStage(newMapName, this.world)
    stage.spawnPlayer(spawnerID)
  }

  private async equipItemEvent(equipmentType: EquipmentTypes, equipmentId: number): Promise<void> {
    const [player] = this.playerFamily.entityArray
    const equipmentComponent = player.getComponent('Equipment')
    equipmentComponent.equipEvent.notify(equipmentType)
    Sound.play('getAirTank')
    this.world.removeEntityById(equipmentId)
  }
}
