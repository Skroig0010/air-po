import { Entity } from '@core/ecs/entity'
import { getSpriteBuffer, SpriteName } from '@core/graphics/art'
import { Vec2 } from '@core/math/vec2'
import { DrawComponent } from '@game/components/drawComponent'
import { getCustomProperty } from '@game/stage/customProperty'
import { StageObject } from '@game/stage/object'
import { TileSet, getTileSetDataFromGid } from '@game/stage/tileLayerLoader'
import { assert } from '@utils/assertion'
import { TilingSprite } from 'pixi.js'
import { EntityFactory } from './entityFactory'

type BackgroundLayer = 'CloseupView' | 'MiddleView' | 'DistantView'
const BACKGROUND_Z_INDEX = {
  CloseupView: -101,
  MiddleView: -102,
  DistantView: -103,
}
const BACKGROUND_SCROLL_SPEED = {
  CloseupView: new Vec2(0.7, 0.8),
  MiddleView: new Vec2(0.4, 0.5),
  DistantView: new Vec2(0.1, 0.1),
}

export class BackgroundFactory extends EntityFactory {
  public constructor(
    private stageObject: StageObject,
    private horizontalY: number,
    private tileSets: Array<TileSet>
  ) {
    super()
  }

  public create(): Entity {
    const bgType = getCustomProperty<BackgroundLayer>(this.stageObject, 'layer')
    assert(bgType !== undefined, 'background layer is not set')
    assert(this.stageObject.gid !== undefined, 'gid not found')
    const { name } = getTileSetDataFromGid(this.stageObject.gid, this.tileSets)

    const entity = new Entity()

    entity.addComponent('Background', {
      scrollSpeed: BACKGROUND_SCROLL_SPEED[bgType],
      horizontalY: this.horizontalY,
    })
    entity.addComponent('Position', new Vec2())
    const texture = getSpriteBuffer(name as SpriteName).definitions['Default'].textures[0]
    const sprite = new TilingSprite(texture, texture.width, texture.height)
    sprite.anchor.set(0.5)
    const drawComponent = new DrawComponent({
      entity,
      child: {
        sprite,
      },
    })
    drawComponent.zIndex = BACKGROUND_Z_INDEX[bgType]
    entity.addComponent('Draw', drawComponent)

    return entity
  }
}
