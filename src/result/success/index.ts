import type { Failure } from '../failure'

export class Success<T> {
  declare value: T

  constructor(value: T) {
    this.value = structuredClone(value)
  }

  debug(
    shouldRun: (() => boolean) | boolean,
    fn: (result: Success<T>) => void,
  ): Success<T> {
    const shouldRunFn
        = typeof shouldRun === 'boolean' ? shouldRun : shouldRun()
    if (shouldRunFn) {
      fn(this)
    }
    return this
  }

  isFailure<F>(): this is Failure<F> {
    return false
  }

  isSuccess(): this is Success<T> {
    return true
  }

  map<NewT>(mapper: (successValue: T) => NewT): Success<NewT> {
    return new Success(mapper(structuredClone(this.value)))
  }

  // No going back to a Result after this, best that can happen is passing Results via .then, .catch, and .finally
  async mapAsync<NewT>(
    mapper: (successValue: T) => Promise<Success<NewT>>,
  ): Promise<Success<NewT>> {
    return await mapper(structuredClone(this.value))
  }

  mapFailure(): Success<T> {
    return this
  }

  recover(): Success<T> {
    return this
  }

  reduce<C, U>(reducer: (result: Success<T>, context: C) => U, context: C): U {
    const newSuccess = new Success(structuredClone(this.value))
    return reducer(newSuccess, context)
  }

  /*
  `tap` lets you access the `Result` without
  doing anything to the `Result` itself.

  This is similar to `debug` but `tap` will always
  run. This is useful for logging or other necessary
  side-effect work.
  */
  // Move to base class?
  tap(fn: (result: Success<T>) => void): Success<T> {
    fn(structuredClone(this))
    return this
  }

  tapFailure(): Success<T> {
    return this
  }

  /*
    `tapSuccess` lets you access the `value` of a `Success`
    without doing anything to anything to the `Success` itself.
  */
  tapSuccess(fn: (successValue: T) => void): Success<T> {
    fn(structuredClone(this.value))
    return this
  }

  valueOrUse(): T {
    return structuredClone(this.value)
  }

  valueOrUseComputed(): T {
    return structuredClone(this.value)
  }
}

export const success = <T>(value: T): Success<T> => {
  return new Success(value)
}
