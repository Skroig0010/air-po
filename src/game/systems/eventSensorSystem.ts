import { Map, MapBuilder } from '@game/map/mapBuilder'
import { Collider } from '@game/components/colliderComponent'
import { Entity } from '@core/ecs/entity'
import { Family, FamilyBuilder } from '@core/ecs/family'
import { System } from '@core/ecs/system'
import { World } from '@core/ecs/world'

export class EventSensorSystem extends System {
  private sensorFamily: Family

  constructor(world: World) {
    super(world)
    this.sensorFamily = new FamilyBuilder(world).include('Sensor').build()
    this.sensorFamily.entityAddedEvent.addObserver((e: Entity) => this.onSensorAdded(e))
  }

  public update(): void {}

  private onSensorAdded(entity: Entity): void {
    const event = entity.getComponent('Sensor').event
    for (const c of entity.getComponent('Collider').colliders) {
      c.callbacks.add(async (_, other: Collider) => {
        if (!other.tag.has('playerSensor')) return
        await this.fireEvent(event)
      })
    }
  }

  private async fireEvent(event: string): Promise<void> {
    const [eventName, ...options] = event.split(' ')
    switch (eventName) {
      case 'changeMap':
        await this.moveEvent(options[0], Number(options[1]))
        break
    }
  }

  private async moveEvent(newMapName: string, spawnerID: number): Promise<void> {
    const map = (await import(`../../../res/map/${newMapName}.json`)) as Map
    this.world.reset()
    const mapBuilder = new MapBuilder(this.world)
    mapBuilder.build(map, spawnerID)
  }
}