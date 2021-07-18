import * as t from 'io-ts'
import { World } from '@core/ecs/world'
import { Vec2 } from '@core/math/vec2'
import { assert } from '@utils/assertion'
import { tileList } from './tileList'
import { Stage } from './stage'
import { Entity } from '@core/ecs/entity'
import WallFactory from '@game/entities/wallFactory'
import { Random } from '@utils/random'
import { CustomPropertyType, getCustomProperty } from './customProperty'
import { SoundName } from '@core/sound/sound'

type TileName = keyof typeof tileList

export const TileSetType = t.type({
  firstgid: t.number,
  source: t.string,
})
export type TileSet = t.TypeOf<typeof TileSetType>

export const TileLayerType = t.type({
  data: t.array(t.number),
  height: t.number,
  id: t.number,
  name: t.string,
  opacity: t.number,
  type: t.literal('tilelayer'),
  visible: t.boolean,
  width: t.number,
  x: t.number,
  y: t.number,
  properties: t.union([t.array(CustomPropertyType), t.undefined]),
})
export type TileLayer = t.TypeOf<typeof TileLayerType>

export type TileSetData = {
  columns: number
  image: string
  imageheight: number
  imagewidth: number
  margin: number
  name: string
  spacing: number
  tilecount: number
  tiledversion: string
  tileheight: number
  tilewidth: number
  type: string
  version: number
}

type Build = (index: Vec2, tileSize: Vec2, frame: number, layer: TileLayer) => void
type Builder = { firstgid: number; build: Build }

export class TileLayerLoader {
  private static rand = new Random()

  private builders: Array<Builder>

  constructor(private stage: Stage, private world: World, tileSets: Array<TileSet>) {
    this.builders = this.loadBuilders(tileSets)
  }

  public load(layer: TileLayer, tileSize: Vec2): void {
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
        const tileId = this.getTileId(layer, x, y)
        if (tileId === 0) continue
        const builder = findBuilder(tileId)
        builder.build(new Vec2(x, y), tileSize, tileId - builder.firstgid, layer)
      }
    }

    const bgmName = getCustomProperty<string>(layer, 'bgm')
    if (bgmName !== undefined) {
      this.stage.setBGM(bgmName as SoundName)
    }
  }

  private loadBuilders(tileSets: Array<TileSet>): Array<Builder> {
    const builders = new Array<Builder>()
    for (const { firstgid, source } of tileSets) {
      const { name, tilewidth, tileheight } = require(`/res/stage/${source}`) // eslint-disable-line  @typescript-eslint/no-var-requires
      const objectSize = new Vec2(tilewidth, tileheight)
      switch (name) {
        case 'wall':
          builders.push({
            firstgid,
            build: (index: Vec2, tileSize: Vec2, _: number, layer: TileLayer) =>
              this.world.addEntity(
                this.buildWall(
                  this.calcPosition(index, tileSize, objectSize),
                  index,
                  firstgid,
                  layer
                )
              ),
          })
          break
        default:
          builders.push({
            firstgid,
            build: (index: Vec2, tileSize: Vec2, frame: number) =>
              this.world.addEntity(
                new tileList[name as TileName](
                  this.calcPosition(index, tileSize, objectSize),
                  name,
                  frame,
                  this.world,
                  this.stage
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

  private getTileId(layer: TileLayer, x: number, y: number): number {
    if (x < 0) return 0
    if (y < 0) return 0
    if (x >= layer.width) return 0
    if (y >= layer.height) return 0
    return layer.data[x + y * layer.width]
  }

  private buildWall(pos: Vec2, index: Vec2, firstgid: number, layer: TileLayer): Entity {
    const cells = []
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        const xi = index.x + i - 1
        const yj = index.y + j - 1
        cells.push(this.getTileId(layer, xi, yj))
      }
    }
    const tileId = this.calcWallId(cells) - firstgid
    const shouldCollide = cells.some(c => c === 0)
    return new WallFactory(pos, tileId, shouldCollide).create()
  }

  private calcWallId(cell: number[]): number {
    if (
      cell[0] != 0 &&
      cell[1] != 0 &&
      cell[2] != 0 &&
      cell[3] != 0 &&
      cell[5] != 0 &&
      cell[6] != 0 &&
      cell[7] != 0 &&
      cell[8] != 0
    ) {
      // completely filled
      return this.randomChoice([10, 11, 14, 15, 18, 19, 22, 23])
    }
    if (
      cell[1] != 0 &&
      cell[2] != 0 &&
      cell[3] != 0 &&
      cell[5] != 0 &&
      cell[6] != 0 &&
      cell[7] != 0 &&
      cell[8] != 0
    ) {
      // lack left up
      return 32
    }
    if (
      cell[0] != 0 &&
      cell[1] != 0 &&
      cell[3] != 0 &&
      cell[5] != 0 &&
      cell[6] != 0 &&
      cell[7] != 0 &&
      cell[8] != 0
    ) {
      // lack right up
      return 29
    }
    if (
      cell[0] != 0 &&
      cell[1] != 0 &&
      cell[2] != 0 &&
      cell[3] != 0 &&
      cell[5] != 0 &&
      cell[7] != 0 &&
      cell[8] != 0
    ) {
      // lack left down
      return 8
    }
    if (
      cell[0] != 0 &&
      cell[1] != 0 &&
      cell[2] != 0 &&
      cell[3] != 0 &&
      cell[5] != 0 &&
      cell[6] != 0 &&
      cell[7] != 0
    ) {
      // lack right down
      return 5
    }
    if (cell[1] == 0 && cell[3] == 0 && cell[5] != 0 && cell[7] != 0) {
      // left up corner
      return 1
    }
    if (cell[1] == 0 && cell[3] != 0 && cell[5] == 0 && cell[7] != 0) {
      // right up corner
      return 4
    }
    if (cell[1] != 0 && cell[3] == 0 && cell[5] != 0 && cell[7] == 0) {
      // left down corner
      return 25
    }
    if (cell[1] != 0 && cell[3] != 0 && cell[5] == 0 && cell[7] == 0) {
      // right down corner
      return 28
    }
    if (cell[1] == 0) {
      // up
      return this.randomChoice([2, 3, 30, 31])
    }
    if (cell[3] == 0) {
      // left
      return this.randomChoice([9, 17, 16, 24])
    }
    if (cell[5] == 0) {
      // right
      return this.randomChoice([12, 20, 13, 21])
    }
    if (cell[7] == 0) {
      // down
      return this.randomChoice([26, 27, 6, 7])
    }
    return 1
  }

  private randomChoice(candidates: number[]): number {
    return candidates[Math.abs(TileLayerLoader.rand.next()) % candidates.length]
  }
}

export const getTileSetDataFromGid = (gid: number, tileSets: Array<TileSet>): TileSetData => {
  const { source } = tileSets.find(tileSet => tileSet.firstgid === gid) as TileSet
  return require(`/res/stage/${source}`) // eslint-disable-line  @typescript-eslint/no-var-requires
}
