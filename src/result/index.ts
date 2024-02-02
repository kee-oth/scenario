/*
    =================
    Result
    =================
*/
export abstract class Result<S, F> {
  value: S | F

  constructor(value: S | F) {
    this.value = value
  }

  static success<T>(value: T) {
    return new Success(value)
  }

  static failure<T>(value: T) {
    return new Failure(value)
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
    fn: (result: Result<S, F>) => void,
  ): Result<S, F> {
    const shouldRunFn
      = typeof shouldRun === 'boolean' ? shouldRun : shouldRun()
    if (shouldRunFn) {
      fn(this)
    }
    return this
  }

  isSuccess(): this is Success<S> {
    return this instanceof Success
  }

  isFailure(): this is Failure<F> {
    return this instanceof Failure
  }

  // the Failure.map method overrides this
  map<NewS>(mapper: (successValue: S) => NewS): Result<NewS, F> {
    return new Success(mapper(structuredClone(this.value) as S))
  }

  // No going back to a Result after this, best that can happen is passing Results via .then, .catch, and .finally
  async mapAsync<NewS>(
    mapper: (successValue: S) => Promise<Result<NewS, F>>,
  ): Promise<Result<NewS, F>> {
    return await mapper(structuredClone(this.value as S))
  }

  mapFailure<NewF>(mapper: (failureValue: F) => NewF): Result<S, NewF> {
    return new Failure(mapper(this.value as F))
  }

  recover(recoverer: (failure: F) => S): Success<S> {
    return new Success(recoverer(this.value as F))
  }

  reduce<T>(reducer: (result: Result<S, F>) => T): T {
    if (this.isFailure()) {
      return reducer(Result.failure(structuredClone(this.value)))
    }
    return reducer(Result.success(structuredClone(this.value as S)))
  }

  /*
    `tap` lets you access the `Result` without
    doing anything to the `Result` itself.

    This is similar to `debug` but `tap` will always
    run. This is useful for logging or other necessary
    side-effect work.
  */
  tap(fn: (result: Result<S, F>) => void): Result<S, F> {
    fn(structuredClone(this))
    return this
  }

  /*
    `tapSuccess` lets you access the `value` of a `Success`
    without doing anything to anything to the `Success` itself.
  */
  tapSuccess(fn: (successValue: S) => void): Result<S, F> {
    fn(structuredClone(this.value as S))
    return this
  }

  /*
    `tapFailure` lets you access the `value` of a `Failure`
    without doing anything to anything to the `Failure` itself.
  */
  tapFailure(fn: (failureValue: F) => void): Result<S, F> {
    fn(structuredClone(this.value as F))
    return this
  }

  /*
    `valueOr` represents the end of the line.
    This is how you can get a definitive value
    out of a Result.
  */
  valueOrUse(value: S): S {
    return value
  }

  valueOrUseComputed(fn: () => S): S {
    return fn()
  }
}

/*
    =================
    Success
    =================
*/
export class Success<T> extends Result<T, never> {
  declare value: T

  constructor(value: T) {
    super(value)
  }

  mapFailure(): Result<T, never> {
    return this
  }

  recover(): Success<T> {
    return this
  }

  tapFailure(): Result<T, never> {
    return this
  }

  valueOrUse(): T {
    return structuredClone(this.value)
  }

  valueOrUseComputed(): T {
    return structuredClone(this.value)
  }
}

/*
    =================
    Failure
    =================
*/
export class Failure<T> extends Result<never, T> {
  declare value: T

  constructor(value: T) {
    super(value)
  }

  map(): Result<never, T> {
    return this
  }

  async mapAsync(): Promise<Result<never, T>> {
    return this
  }

  tapSuccess(): Result<never, T> {
    return this
  }
}
