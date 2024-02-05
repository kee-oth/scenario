import type { Some } from '../some'
import { some } from '../some'

/*
  We're instantiating None with a generic `T` in order to
  ensure predictable type information when switching from
  Some to None (and vice versa).

  This is notable for `recover` which is supposed to get
  back on the happy path with a value of the original type.
  We wouldn't have that original type information without
  utilizing the generic `T`.
*/
export class None<T> {
  declare value: never

  constructor() {}

  isNone(): this is None<T> {
    return true
  }

  isSome(): this is Some<T> {
    return false
  }

  map<NewT>(): None<NewT> {
    return new None<NewT>()
  }

  async mapAsync<NewT>(): Promise<None<NewT>> {
    return new None<NewT>()
  }

  recover(recoverer: () => T): Some<T> {
    return some(recoverer())
  }

  reduce<C, U>(reducer: (result: Failure<T>, context: C) => U, context: C): U {
    const newFailure = new Failure(structuredClone(this.value))
    return reducer(newFailure, context)
  }
}

export const none = <T>() => {
  return new None<T>()
}
