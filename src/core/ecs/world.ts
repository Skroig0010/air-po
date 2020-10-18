import { Entity } from './entity'
import { System } from './system'
import { EventNotifier } from '../eventNotifier'
import { Container } from 'pixi.js'
import { application } from '../application'
import { assert } from '../../utils/assertion'
import { Behaviour } from '../ai/behaviour'

export class World {
  private readonly entities: Set<Entity>
  private readonly systems: Set<System>
  public readonly stage: Container
  public readonly entityAddedEvent: EventNotifier<Entity>
  public readonly entityRemovedEvent: EventNotifier<Entity>
  public readonly behaviour: Behaviour<World>

  private readonly _updateCallback = (): void => {
    const { done, value: nextWorld } = this.behaviour.next()

    this.systems.forEach(system => {
      system.update(1 / 60)
    })

    if (!!done === true) {
      assert(nextWorld)
      nextWorld.start()
      this.end()
    }
  }

  public constructor(behaviour: (world: World) => Behaviour<World>) {
    this.entities = new Set()
    this.systems = new Set()
    this.stage = new Container()
    this.entityAddedEvent = new EventNotifier()
    this.entityRemovedEvent = new EventNotifier()
    this.behaviour = behaviour(this)
  }

  public start(): void {
    application.stage.addChild(this.stage)
    application.ticker.add(this._updateCallback)
  }

  public end(): void {
    application.ticker.remove(this._updateCallback)
    application.stage.removeChild(this.stage)
  }

  public get entitySet(): Set<Entity> {
    return new Set(this.entities)
  }

  public get entityArray(): Entity[] {
    return Array.from(this.entities)
  }

  // GCによるパフォーマンス低下を防ぐために、できるだけこちらを使う
  public get entityIterator(): IterableIterator<Entity> {
    return this.entities[Symbol.iterator]()
  }

  public get systemSet(): Set<System> {
    return new Set(this.systems)
  }

  public get systemArray(): System[] {
    return Array.from(this.systems)
  }

  // GCによるパフォーマンス低下を防ぐために、できるだけこちらを使う
  public get systemIterator(): IterableIterator<System> {
    return this.systems[Symbol.iterator]()
  }

  public addEntity(...entities: Entity[]): void {
    for (const entity of entities) {
      this.entities.add(entity)
      this.entityAddedEvent.notify(entity)
    }
  }

  public removeEntity(...entities: Entity[]): void {
    for (const entity of entities) {
      this.entities.delete(entity)
      this.entityRemovedEvent.notify(entity)
    }
  }

  public reset(): void {
    const entities = new Set(this.entities) // to ensure the order of actual remove and callback
    this.entities.clear()
    for (const entity of entities) {
      this.entityRemovedEvent.notify(entity)
    }
    for (const system of this.systems) {
      system.init()
    }
  }

  public addSystem(...systems: System[]): void {
    for (const system of systems) {
      system.init()
      this.systems.add(system)
    }
  }

  public removeSystem(...systems: System[]): void {
    for (const system of systems) {
      this.systems.delete(system)
    }
  }
}
