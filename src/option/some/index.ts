import type { Option } from '..'
import type { None } from '../none'
import { none } from '../none'

export class Some<T> {
  value: T

  constructor(value: T) {
    this.value = value
  }

  isNone(): this is None<T> {
    return false
  }

  isSome<T>(): this is Some<T> {
    return true
  }

  map<NewT>(mapper: (currentValue: T) => NewT): Some<NewT> {
    return new Some(mapper(structuredClone(this.value)))
  }

  // No going back to an Option after this, best that can happen is passing Options via .then, .catch, and .finally
  async mapAsync<NewT>(
    mapper: (successValue: T) => Promise<Some<NewT>>,
  ): Promise<Some<NewT>> {
    return await mapper(structuredClone(this.value))
  }

  recover(): Some<T> {
    return this
  }

  reduce<C, U>(reducer: (currentValue: Some<T>, context: C) => U, context: C): U {
    const newSome = new Some(structuredClone(this.value))
    return reducer(newSome, context)
  }
}

export const some = <T>(value: T) => {
  return new Some(value)
}
