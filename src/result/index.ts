// Using `isSuccess` lets us be able to pass `undefined` to
// `successValue` and still understand that the user is looking
// for a Success
type ResultContructorParams<S = never, F = never> = ({
  isSuccess: true
  successValue: S
} | {
  isSuccess: false
  failureValue: F
})

export class Result<S, F> {
  declare private successValue: S
  declare private failureValue: F

  constructor(params: ResultContructorParams<S, F>) {
    if (params.isSuccess) {
      this.successValue = params.successValue
    } else {
      this.failureValue = params.failureValue
    }
  }

  static newKind<T, U>(): [(value: T) => Result<T, U>, (value: U) => Result<T, U>] {
    const success = Result.success
    const failure = Result.failure

    return [success, failure]
  }

  // Allows devs to create a Result from arbitrary data, depending on whether
  // the passed in value returns (undefined | null) or something else.
  // TODO: test
  static fromNullish<D, T, U>(
    data: D,
    valueOfFailureIfNullish: U,
    transformer: (data: D) => T,
  ): Result<T, U> {
    const value = transformer(data) ?? null
    if (value !== null) {
      return Result.success(value)
    }

    return Result.failure(valueOfFailureIfNullish)
  }

  // TODO: test
  static fromValidator<T, U>(
    validator: (valueToTest: T) => boolean,
    valueToTest: T,
    valueIfFailure: U,
  ): Result<T, U> {
    if (validator(valueToTest)) {
      return Result.success(valueToTest)
    }

    return Result.failure(valueIfFailure)
  }

  // TODO:
  // static fromError

  static success<T, U = never>(value: T) {
    return new Result<T, U>({ isSuccess: true, successValue: value })
  }

  static failure<T, U = never>(value: T) {
    return new Result<U, T>({ isSuccess: false, failureValue: value })
  }

  // TODO
  // private clone(): Result<S, F> {
  // }

  // private cloneFailureValue(): S {
  // }

  // private cloneSuccessValue(): F {
  // }

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

  isFailure(): this is Result<never, F> {
    return !this.isSuccess()
  }

  isSuccess(): this is Result<S, never> {
    return this.successValue !== undefined
  }

  map<NewS>(mapper: (successValue: S) => NewS): Result<NewS, F> {
    if (this.isSuccess()) {
      return Result.success(mapper(structuredClone(this.successValue)))
    } else {
      return Result.failure(this.failureValue)
    }
  }

  mapFailure<NewF>(mapper: (failureValue: F) => NewF): Result<S, NewF> {
    if (this.isFailure()) {
      return Result.failure(mapper(structuredClone(this.failureValue)))
    } else {
      return Result.success(this.successValue)
    }
  }

  // TODO
  // This is a way to shortcircuit and just throw an error when None
  // Can continue along the path otherwise. Kinda like Rust's `?`
  // that sends errors upward
  orError(fn: (result: Result<S, F>) => never): Result<S, F> {
    if (this.isFailure()) {
      fn(this) // TODO: clone
    }

    return this
  }

  recover(
    recoverWith: (failureValue: F) => S,
  ): Result<S, F> {
    if (this.isSuccess()) {
      return this
    }

    return Result.success(recoverWith(structuredClone(this.failureValue)))
  }

  reduce<C, R>(
    reducer: (context: C, result: Result<S, F>) => R,
    context: C,
  ): R {
    const newResult = this.isSuccess() ? Result.success(structuredClone(this.successValue)) : Result.failure(structuredClone(this.failureValue))
    return reducer(context, newResult)
  }

  /*
  `runEffect` lets you access the `Result` without
  doing anything to the `Result` itself.

  This is similar to `debug` but `runEffect` will always
  run. This is useful for logging or other necessary
  side-effect work.
  */
  runEffect(effect: (result: Result<S, F>) => void): Result<S, F> {
    effect(structuredClone(this))
    return this
  }

  runEffectWhenFailure(effect: (failureValue: F) => void): Result<S, F> {
    if (this.isFailure()) {
      effect(structuredClone(this.failureValue))
    }
    return this
  }

  /*
    `runEffectWhenSuccess` lets you access the `value` of a `Success`
    without doing anything to anything to the `Success` itself.
  */
  runEffectWhenSuccess(effect: (successValue: S) => void): Result<S, F> {
    if (this.isSuccess()) {
      effect(structuredClone(this.successValue))
    }
    return this
  }

  // TODO: test
  validate(
    validator: (successValue: S) => boolean,
    valueIfFailure: F,
  ): Result<S, F> {
    if (this.isFailure()) {
      return this
    }

    if (validator(structuredClone(this.successValue))) {
      return this
    }

    return Result.failure(valueIfFailure)
  }

  // Don't encourage using this one
  // instead of `panic`ing, we make this JS friendly which is to be safe
  // and not offer easy/unexpected ways to crash programs
  value(): S | F {
    return this.isSuccess() ? this.successValue : this.failureValue
  }

  valueOr(value: S): S {
    return this.isSuccess() ? this.successValue : value
  }

  valueOrCompute(fn: () => S): S {
    return this.isSuccess() ? this.successValue : fn()
  }
}

// const getResult = (kind: 'failure' | 'success') => {
// return kind === 'failure' ? Result.failure<string, number>('FAILURE') : Result.success<number, string>(0)
// }

// type DatabaseFailure = 'UNABLE_TO_GET_ENTITY' | 'UNABLE_TO_CREATE_ENTITY'
// type Artist = { id: string, name: string }

// const [success, databaseFailure] = Result.newKind<Artist, DatabaseFailure>()

// const getArtist = (kind: 'failure' | 'success') => {
//   return kind === 'failure' ? databaseFailure('UNABLE_TO_GET_ENTITY') : success({ id: '1234', name: 'Kenshi Yonezu' })
// }

// const createArtist = (kind: 'failure' | 'success') => {
//   return kind === 'failure' ? databaseFailure('UNABLE_TO_CREATE_ENTITY') : success({ id: '1234', name: 'Kenshi Yonezu' })
// }

// const aResult = getResult('success')
//   .map((successValue) => successValue + 10)
//   .mapFailure((failureValue) => `MAPPED_${failureValue}`)
// .valueOrCompute(() => 3)

// if (aResult.isSuccess()) {
//   aResult.value()
// } else if (aResult.isFailure()) {
//   aResult.value()
// }

// const aResult = Result.success(3)
// const newResult = aResult.map((value) => value + 10)

// console.log(newResult.value())

// const aResult2 = Result.failure(3)
// const newResult2 = aResult.map((value) => value + 10)

// console.log(newResult2.value())

// if (aResult.isSuccess()) {
//   aResult.value()
// } else {
//   aResult.value()
// }

// if (aResult2.isFailure()) {
//   aResult2.value()
// } else {
//   aResult2.value()
// }
