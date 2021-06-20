/*+.† NOTIFICATION †.+*/
// this file is automatically written by arttool.
// you can update this file by type "yarn arttool" command.

// IMPORT
import airGeyserSetting from '@res/setting/airGeyser.json'
import airGeyserImg from '@res/image/airGeyser.png'
import ballBulletSetting from '@res/setting/ballBullet.json'
import ballBulletImg from '@res/image/ballBullet.png'
import balloonVineSetting from '@res/setting/balloonVine.json'
import balloonVineImg from '@res/image/balloonVine.png'
import boss1Setting from '@res/setting/boss1.json'
import boss1Img from '@res/image/boss1.png'
import dandelionSetting from '@res/setting/dandelion.json'
import dandelionImg from '@res/image/dandelion.png'
import dandelionFluffSetting from '@res/setting/dandelionFluff.json'
import dandelionFluffImg from '@res/image/dandelionFluff.png'
import enemy1Setting from '@res/setting/enemy1.json'
import enemy1Img from '@res/image/enemy1.png'
import equipmentSetting from '@res/setting/equipment.json'
import equipmentImg from '@res/image/equipment.png'
import jetEffectSetting from '@res/setting/jetEffect.json'
import jetEffectImg from '@res/image/jetEffect.png'
import mossSetting from '@res/setting/moss.json'
import mossImg from '@res/image/moss.png'
import mushroomSetting from '@res/setting/mushroom.json'
import mushroomImg from '@res/image/mushroom.png'
import needleBulletSetting from '@res/setting/needleBullet.json'
import needleBulletImg from '@res/image/needleBullet.png'
import playerSetting from '@res/setting/player.json'
import playerImg from '@res/image/player.png'
import respawnSetting from '@res/setting/respawn.json'
import respawnImg from '@res/image/respawn.png'
import slime1Setting from '@res/setting/slime1.json'
import slime1Img from '@res/image/slime1.png'
import snibeeSetting from '@res/setting/snibee.json'
import snibeeImg from '@res/image/snibee.png'
import throughFloorSetting from '@res/setting/throughFloor.json'
import throughFloorImg from '@res/image/throughFloor.png'
import titleSetting from '@res/setting/title.json'
import titleImg from '@res/image/title.png'
import uiAirSetting from '@res/setting/uiAir.json'
import uiAirImg from '@res/image/uiAir.png'
import uiAirtankBgSetting from '@res/setting/uiAirtankBg.json'
import uiAirtankBgImg from '@res/image/uiAirtankBg.png'
import uiAirtankBodySetting from '@res/setting/uiAirtankBody.json'
import uiAirtankBodyImg from '@res/image/uiAirtankBody.png'
import uiAirtankTailSetting from '@res/setting/uiAirtankTail.json'
import uiAirtankTailImg from '@res/image/uiAirtankTail.png'
import uiHpHeartSetting from '@res/setting/uiHpHeart.json'
import uiHpHeartImg from '@res/image/uiHpHeart.png'
import uiWeaponBackgroundSetting from '@res/setting/uiWeaponBackground.json'
import uiWeaponBackgroundImg from '@res/image/uiWeaponBackground.png'
import uiWeaponGunSetting from '@res/setting/uiWeaponGun.json'
import uiWeaponGunImg from '@res/image/uiWeaponGun.png'
import vineSetting from '@res/setting/vine.json'
import vineImg from '@res/image/vine.png'
import wallSetting from '@res/setting/wall.json'
import wallImg from '@res/image/wall.png'

import { BaseTexture, Rectangle, Texture } from 'pixi.js'

type Setting = {
  name: string
  path: string
  texture?: {
    size?: {
      width: number
      height: number
    }
  }
}

function loadTexture(url: string): Promise<BaseTexture> {
  return new Promise((resolve, reject) => {
    const texture = BaseTexture.from(url)
    if (texture.width > 0) resolve(texture)
    texture.on('loaded', (tex: BaseTexture) => {
      resolve(tex)
    })
    texture.on('error', (_tex: BaseTexture, event: ErrorEvent) => {
      reject(event)
    })
  })
}

async function buildTextureCache(baseURL: string, setting: Setting): Promise<Array<Texture>> {
  const base = await loadTexture(baseURL)
  const result = new Array<Texture>()
  const w = setting.texture?.size?.width ?? base.width
  const h = setting.texture?.size?.height ?? base.height
  for (let y = 0; y < base.height / h; y++) {
    for (let x = 0; x < base.width / w; x++) {
      const texture = new Texture(base, new Rectangle(x * w, y * h, w, h))
      result.push(texture)
    }
  }
  return result
}

export const textureStore: { [key: string]: Array<Texture> } = {}
export const init = async (): Promise<void> => {
  // LOAD_RESOURCE
  textureStore.airGeyser = await buildTextureCache(airGeyserImg, airGeyserSetting)
  textureStore.ballBullet = await buildTextureCache(ballBulletImg, ballBulletSetting)
  textureStore.balloonVine = await buildTextureCache(balloonVineImg, balloonVineSetting)
  textureStore.boss1 = await buildTextureCache(boss1Img, boss1Setting)
  textureStore.dandelion = await buildTextureCache(dandelionImg, dandelionSetting)
  textureStore.dandelionFluff = await buildTextureCache(dandelionFluffImg, dandelionFluffSetting)
  textureStore.enemy1 = await buildTextureCache(enemy1Img, enemy1Setting)
  textureStore.equipment = await buildTextureCache(equipmentImg, equipmentSetting)
  textureStore.jetEffect = await buildTextureCache(jetEffectImg, jetEffectSetting)
  textureStore.moss = await buildTextureCache(mossImg, mossSetting)
  textureStore.mushroom = await buildTextureCache(mushroomImg, mushroomSetting)
  textureStore.needleBullet = await buildTextureCache(needleBulletImg, needleBulletSetting)
  textureStore.player = await buildTextureCache(playerImg, playerSetting)
  textureStore.respawn = await buildTextureCache(respawnImg, respawnSetting)
  textureStore.slime1 = await buildTextureCache(slime1Img, slime1Setting)
  textureStore.snibee = await buildTextureCache(snibeeImg, snibeeSetting)
  textureStore.throughFloor = await buildTextureCache(throughFloorImg, throughFloorSetting)
  textureStore.title = await buildTextureCache(titleImg, titleSetting)
  textureStore.uiAir = await buildTextureCache(uiAirImg, uiAirSetting)
  textureStore.uiAirtankBg = await buildTextureCache(uiAirtankBgImg, uiAirtankBgSetting)
  textureStore.uiAirtankBody = await buildTextureCache(uiAirtankBodyImg, uiAirtankBodySetting)
  textureStore.uiAirtankTail = await buildTextureCache(uiAirtankTailImg, uiAirtankTailSetting)
  textureStore.uiHpHeart = await buildTextureCache(uiHpHeartImg, uiHpHeartSetting)
  textureStore.uiWeaponBackground = await buildTextureCache(
    uiWeaponBackgroundImg,
    uiWeaponBackgroundSetting
  )
  textureStore.uiWeaponGun = await buildTextureCache(uiWeaponGunImg, uiWeaponGunSetting)
  textureStore.vine = await buildTextureCache(vineImg, vineSetting)
  textureStore.wall = await buildTextureCache(wallImg, wallSetting)
}
