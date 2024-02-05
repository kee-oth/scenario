import { Success } from '../success'

export class Failure<T> {
  value: T

  constructor(value: T) {
    this.value = structuredClone(value)
  }

  /*
    `debug` lets you access the `Result` without
    doing anything to the `Result` itself.

    This is similar to `tap` but will only run if
    `shouldRun` return true. This is useful for controlling
    if debug functionality should run in different environments.

    Note you can call `debug` as many times as you'd like should
    you can have different debug operations depending on the
    environment (or any other condition)
  */
  debug(
    shouldRun: (() => boolean) | boolean,
    fn: (result: Failure<T>) => void,
  ): Failure<T> {
    const shouldRunFn
        = typeof shouldRun === 'boolean' ? shouldRun : shouldRun()
    if (shouldRunFn) {
      fn(this)
    }
    return this
  }

  isFailure(): this is Failure<T> {
    return true
  }

  isSuccess<S>(): this is Success<S> {
    return false
  }

  map(): Failure<T> {
    return this
  }

  async mapAsync(): Promise<Failure<T>> {
    return this
  }

  mapFailure<NewF>(mapper: (failureValue: T) => NewF): Failure<NewF> {
    return new Failure(mapper(this.value))
  }

  // Should this only be recoverable to original Success value type?
  // This would require Failure taking in two generics: one for its
  // own type and one for the intended corresponding Success type.
  // That would make for noisy types.
  recover<NewT>(recoverer: (failureValue: T) => NewT): Success<NewT> {
    return new Success(recoverer(structuredClone(this.value)))
  }

  reduce<C, U>(reducer: (result: Failure<T>, context: C) => U, context: C): U {
    const newFailure = new Failure(structuredClone(this.value))
    return reducer(newFailure, context)
  }

  // Move to base class?
  tap(fn: (result: Failure<T>) => void): Failure<T> {
    fn(structuredClone(this))
    return this
  }

  tapFailure(fn: (failureValue: T) => void): Failure<T> {
    fn(structuredClone(this.value))
    return this
  }

  tapSuccess(): Failure<T> {
    return this
  }

  valueOrUse(value: T): T {
    return value
  }

  valueOrUseComputed(fn: () => T): T {
    return fn()
  }
}

export const failure = <T>(value: T) => {
  return new Failure(value)
}
