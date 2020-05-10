import { Node, NodeState } from '../node'
import { Entity } from '../../ecs/entity'
import { World } from '../../ecs/world'

export class While implements Node {
  public constructor(private arg: { cond: Node; exec: Node }) {}
  public initState(): void {
    this.arg.cond.initState()
    this.arg.exec.initState()
  }

  public execute(entity: Entity, world: World): NodeState {
    switch (this.arg.cond.execute(entity, world)) {
      case NodeState.Success:
        if (this.arg.exec.execute(entity, world) !== NodeState.Running) {
          this.arg.exec.initState()
        }
        return NodeState.Running
      case NodeState.Running:
        return NodeState.Running
      case NodeState.Failure:
        return NodeState.Success
    }
  }
}
