import { Entity } from '../ecs/entity'
import { EntityFactory } from './entityFactory'
import { BalloonVineFactory } from './balloonVineFactory'
import { Enemy1Factory } from './enemy1Factory'
import { SnibeeFactory } from './snibeeFactory'
import { World } from '../ecs/world'
import { assert } from '../../utils/assertion'

export type NPCType = 'enemy1' | 'snibee' | 'balloonvine'

export class NPCFactory extends EntityFactory {
  public constructor(private world: World, private type: NPCType) {
    super()
  }

  public create(): Entity {
    switch (this.type) {
      case 'enemy1':
        return new Enemy1Factory(this.world).create()
      case 'snibee':
        return new SnibeeFactory(this.world).create()
      case 'balloonvine':
        return new BalloonVineFactory(this.world).create()
      default:
        assert(false)
    }
  }
}
