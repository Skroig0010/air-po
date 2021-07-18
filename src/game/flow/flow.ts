import { titleFlow } from './title/titleFlow'

export type Flow = Generator<void, Flow>

export const totalFlow = function*(): Flow {
  let flow = titleFlow()
  while (true) {
    flow = yield* flow
  }
}
