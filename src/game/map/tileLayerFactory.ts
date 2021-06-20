import { World } from '@core/ecs/world'
import { Vec2 } from '@core/math/vec2'
import { BalloonVineFactory } from '@game/entities/tile/balloonVineFactory'
import { DandelionFactory } from '@game/entities/tile/dandelionFactory'
import { Enemy1Factory } from '@game/entities/tile/enemy1Factory'
import { MushroomFactory } from '@game/entities/tile/mushroomFactory'
import { MossFactory } from '@game/entities/tile/mossFactory'
import { Slime1Factory } from '@game/entities/tile/slime1Factory'
import { SnibeeFactory } from '@game/entities/tile/snibeeFactory'
import { ThroughFloorFactory } from '@game/entities/tile/throughFloorFactory'
import { TileEntityFactory } from '@game/entities/tile/tileEntityFactory'
import { VineFactory } from '@game/entities/tile/vineFactory'
import { WallFactory } from '@game/entities/tile/wallFactory'
import { assert } from '@utils/assertion'
import { TileSet, TileLayer, getTileId, MapBuilder } from './mapBuilder'
import { RespawnFlagFactory } from '@game/entities/tile/respawnFlagFactory'
import { Boss1Factory } from '@game/entities/tile/boss1Factory'

type Build = (index: Vec2, tileSize: Vec2, frame: number, layer: TileLayer) => void
type Builder = { firstgid: number; build: Build }

export class TileLayerFactory {
  private builders: Array<Builder>

  constructor(private builder: MapBuilder, private world: World, tileSets: Array<TileSet>) {
    this.builders = this.loadBuilders(tileSets)
  }

  public build(layer: TileLayer, tileSize: Vec2): void {
    const findBuilder = (tileId: number): Builder => {
      for (let i = 0; i < this.builders.length; i++) {
        if (tileId < this.builders[i].firstgid) continue
        if (i < this.builders.length - 1 && this.builders[i + 1].firstgid <= tileId) continue
        return this.builders[i]
      }
      assert(false, `Could not find appropriate builder for tileId ${tileId}`)
    }

    for (let x = 0; x < layer.width; x++) {
      for (let y = 0; y < layer.height; y++) {
        const tileId = getTileId(layer, x, y)
        if (tileId === 0) continue
        const builder = findBuilder(tileId)
        builder.build(new Vec2(x, y), tileSize, tileId - builder.firstgid, layer)
      }
    }
  }

  private loadBuilders(tileSets: Array<TileSet>): Array<Builder> {
    const builders = new Array<Builder>()
    const factories: {
      [keys: string]: new (
        pos: Vec2,
        name: string,
        frame: number,
        world: World,
        builder: MapBuilder
      ) => TileEntityFactory
    } = {
      boss1: Boss1Factory,
      balloonVine: BalloonVineFactory,
      dandelion: DandelionFactory,
      enemy1: Enemy1Factory,
      mushroom: MushroomFactory,
      moss: MossFactory,
      slime1: Slime1Factory,
      snibee: SnibeeFactory,
      throughFloor: ThroughFloorFactory,
      vine: VineFactory,
      respawn: RespawnFlagFactory,
    }
    for (const { firstgid, source } of tileSets) {
      const { name, tilewidth, tileheight } = require(`../../../res/map/${source}`) // eslint-disable-line  @typescript-eslint/no-var-requires
      const objectSize = new Vec2(tilewidth, tileheight)
      switch (name) {
        case 'wall':
          builders.push({
            firstgid,
            build: (index: Vec2, tileSize: Vec2, _: number, layer: TileLayer) =>
              this.world.addEntity(
                new WallFactory(
                  this.calcPosition(index, tileSize, objectSize),
                  index,
                  firstgid,
                  layer
                ).create()
              ),
          })
          break
        default:
          builders.push({
            firstgid,
            build: (index: Vec2, tileSize: Vec2, frame: number) =>
              this.world.addEntity(
                new factories[name](
                  this.calcPosition(index, tileSize, objectSize),
                  name,
                  frame,
                  this.world,
                  this.builder
                ).create()
              ),
          })
          break
      }
    }
    return builders
  }

  private calcPosition(index: Vec2, tileSize: Vec2, objectSize: Vec2): Vec2 {
    return new Vec2(
      index.x * tileSize.x + objectSize.x / 2,
      (index.y + 1) * tileSize.y - objectSize.y / 2
    )
  }
}
