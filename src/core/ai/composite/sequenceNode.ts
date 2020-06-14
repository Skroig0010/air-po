import { Entity } from '../../ecs/entity'
import { World } from '../../ecs/world'
import { BehaviourNode, NodeState } from '../behaviourNode'

export class SequenceNode implements BehaviourNode {
  private executingNodes: Array<BehaviourNode> = []

  public constructor(protected children: Array<BehaviourNode> = []) {
    this.initState()
  }

  public addChild(node: BehaviourNode): void {
    this.children.push(node)
    this.executingNodes.push(node)
  }

  public initState(): void {
    this.children.forEach(node => node.initState())
    this.executingNodes = this.children.concat()
  }

  public execute(entity: Entity, world: World): NodeState {
    if (this.children.length === 0) return NodeState.Success
    if (this.executingNodes.length === 0) {
      throw 'call already successed sequence node.'
    }

    let state = this.executingNodes[0].execute(entity, world)
    while (state === NodeState.Success) {
      this.executingNodes.shift()
      if (this.executingNodes.length === 0) {
        return NodeState.Success
      }

      state = this.executingNodes[0].execute(entity, world)
    }
    return state
  }
}
