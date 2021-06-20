import { assert } from './assertion'

export type Dependency = {
  before?: string[]
  after?: string[]
}

export class Process {
  constructor(private func: () => void, public name?: string, public dependency: Dependency = {}) {}

  execute(): void {
    this.func()
  }
}

export class ProcessManager {
  private processList: Process[] = []
  private hasChanged = true

  public execute(): void {
    if (this.hasChanged) {
      this.hasChanged = false
      this.updateProcessList()
    }
    for (const proc of this.processList) {
      proc.execute()
    }
  }

  public addProcess(proc: Process): void {
    this.processList.push(proc)
    this.hasChanged = true
  }

  public removeProcess(proc: Process): void {
    this.processList.splice(this.processList.indexOf(proc), 1)
    this.hasChanged = true
  }

  private updateProcessList(): void {
    const dependencyMap = new Map<Process, Process[]>() // key depends on value(key must be executed after value)
    for (const proc of this.processList) {
      dependencyMap.set(proc, [])
    }
    for (const proc of this.processList) {
      for (const name2 of proc.dependency.before ?? []) {
        const processes = this.processList.filter(proc2 => proc2.name === name2)
        if (processes.length == 0) continue
        // proc must be executed before proc2
        for (const proc2 of processes) {
          dependencyMap.get(proc2)?.push(proc)
        }
      }
      for (const name2 of proc.dependency.after ?? []) {
        const processes = this.processList.filter(proc2 => proc2.name === name2)
        if (processes.length == 0) continue
        // proc must be executed after proc2
        for (const proc2 of processes) {
          dependencyMap.get(proc)?.push(proc2)
        }
      }
    }
    // TODO: detect circular reference
    const remainingProcessSet = new Set<Process>(this.processList)
    const finishedProcessSet = new Set<Process>()
    this.processList = []
    while (remainingProcessSet.size > 0) {
      let hasChanged = false
      for (const proc of remainingProcessSet) {
        if (dependencyMap.get(proc)?.every(proc2 => finishedProcessSet.has(proc2))) {
          this.processList.push(proc)
          finishedProcessSet.add(proc)
          remainingProcessSet.delete(proc)
          hasChanged = true
        }
      }
      assert(
        hasChanged,
        `cannot resolve dependency: ${Array.from(remainingProcessSet).map(proc => proc.name)}`
      )
    }

    for (const proc of this.processList) {
      for (const name2 of proc.dependency.before ?? []) {
        assert(
          this.processList.findIndex(p => p === proc) <
            this.processList.findIndex(p => p.name === name2),
          `${proc.name} must be before ${name2}`
        )
      }
      for (const name2 of proc.dependency.after ?? []) {
        assert(
          this.processList.findIndex(p => p === proc) >
            this.processList.findIndex(p => p.name === name2),
          `${proc.name} must be after ${name2}`
        )
      }
    }
  }
}
