import { World } from '@core/ecs/world'
import { BackgroundFactory } from '@game/entities/backgroundFactory'
import { assert } from '@utils/assertion'
import { ObjectLayer } from './objectLayerLoader'
import { TileSet } from './tileLayerLoader'
import { getCustomProperty } from './customProperty'

export const loadBackgroundLayer = (
  layer: ObjectLayer,
  world: World,
  tileSets: Array<TileSet>
): void => {
  const horizontalY = getCustomProperty<number>(layer, 'horizontalY')
  assert(horizontalY !== undefined, 'y coordinate of background is not set')

  for (const object of layer.objects) {
    world.addEntity(new BackgroundFactory(object, horizontalY, tileSets).create())
  }
}
