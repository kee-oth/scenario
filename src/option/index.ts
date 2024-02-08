/**
 * The Option class represents the prescense or absence of a value.
 * Use it when you want to safely work with data that _may_ or
 * _may not_ be there.
 * @class
 */
export class Option<V> {
  private currentValue: V

  private constructor(value?: V) {
    // If we pass in `undefined` or `null`, we want to set `currentValue` to `null`.
    // That way, other useful falsey values like empty string and `0` can still
    // be used as the `currentValue`
    this.currentValue = value ?? null as V
  }

  private clone(): Option<V> {
    return new Option(this.cloneValue())
  }

  private cloneValue(): V {
    return structuredClone(this.currentValue)
  }

  /**
   * Creates an Option from `value`.
   *
   * If `value` is `undefined` or `null`,
   * a None will be created and returned.
   * Otherwise, a Some containing the passed in `value` will be created and returned.
   *
   * @example
   * const noneOption = Option.from(null)
   *
   * const someOption = Option.from(100)
   */
  static from<T = never>(value: T) {
    return new Option<T>(value)
  }

  /**
   * Creates an Option given a function which can throw.
   *
   * If `throwable` `throw`s or returns `undefined` or `null`,
   * a None will be created and returned.
   * Otherwise, a Some containing the return value of `throwable` will be created and returned.
   *
   * @example
   *  const throwableFunction = (shouldError: boolean): number | never => {
   *    if (shouldError) {
   *      throw new Error('Some error!')
   *    }
   *    return 100
   *  }
   *  const noneOption = Option.fromError(() => throwableFunction(true))
   *  noneOption.valueOr(200) // `200`
   *
   *  const someOption = Option.fromError(() => throwableFunction(false))
   *  someOption.valueOr(200) // `100`
   */
  static fromError<T>(throwable: (() => T | never)): Option<T> {
    try {
      return Option.some(throwable())
    } catch {
      return Option.none()
    }
  }

  static none<T = never>() {
    return new Option<T>()
  }

  static some<T = never>(value: T) {
    return new Option<T>(value)
  }

  debug(
    shouldRun: (() => boolean) | boolean,
    fn: (result: Option<V>) => void,
  ): Option<V> {
    const shouldRunFn
        = typeof shouldRun === 'boolean' ? shouldRun : shouldRun()
    if (shouldRunFn) {
      fn(this.clone())
    }
    return this
  }

  isSome(): this is Option<NonNullable<V>> {
    return this.currentValue !== null
  }

  isNone(): this is Option<never> {
    return !this.isSome()
  }

  map<NewV>(mapper: (value: V) => NewV): Option<NewV> {
    if (this.isSome()) {
      return Option.some(mapper(this.cloneValue()))
    }

    return Option.none<NewV>()
  }

  // This is a way to shortcircuit and just throw an error
  // when None. Otherwise we continue along per usual.
  // Similar to Rust's `?` operator that sends errors upward.
  orError(fn: (option: Option<V>) => never): Option<V> {
    if (this.isNone()) {
      fn(this.clone())
    }

    return this
  }

  recover(
    recoverWith: () => V,
  ): Option<V> {
    if (this.isSome()) {
      return this
    }

    return Option.some(recoverWith())
  }

  /**
   * Similar to `Array.reduce`. An initial value (`context`)
   * and the value (or `undefined` if None) are passed to a
   * callback (`reducer`) and gives the option to transform
   * to a different type.
   *
   * Though you could choose to close-over values instead of passing
   * them in as `context`, doing so makes it more difficult to test
   * the functions you may need to pass as `reducer` as they are no
   * longer pure functions.
   *
   * @example
   * // None usage
   * const noneOption = Option.from<never>(null)
   * noneOption.reduce((context, value) => !!(context && value), 100) // false
   *
   * // Some usage
   * const someOption = Option.some(10)
   * someOption.reduce((context, value) => !!(context && value), 100) // true
   */
  reduce<C, R>(
    reducer: (context: C, value?: V) => R,
    context: C,
  ): R
  reduce<C, R>(
    reducer: (context?: C, value?: V) => R,
    context?: C,
  ): R {
    return reducer(context, this.clone().valueOrUndefined())
  }

  /**
   * Let's you run an arbitrary function without affecting anything.
   * Useful for running side-effects like logging or analytics.
   *
   * @example
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.runEffect((value) => sendToLog(value)) // will run
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.runEffect((value) => sendToLog(value)) // will run
   */
  runEffect(effect: (result: Option<V>) => void): Option<V> {
    effect(this.clone())
    return this
  }

  /**
   * Let's you run an arbitrary function without affecting anything
   * when Option is None. Useful for running side-effects like logging
   * or analytics.
   *
   * @example
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.runEffectWhenNone((value) => sendToLog(value)) // will run
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.runEffectWhenNone((value) => sendToLog(value)) // won't run
   */
  runEffectWhenNone(fn: () => void): Option<V> {
    if (this.isNone()) {
      fn()
    }
    return this
  }

  /**
   * Gives access to the Option value when Some without
   * doing anything else. Useful for running side-effects
   * like logging or analytics.
   *
   * @example
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.runEffectWhenSome((value) => sendToLog(value)) // won't run
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.runEffectWhenSome((value) => sendToLog(value)) // will run
   */
  runEffectWhenSome(fn: (value: V) => void): Option<V> {
    if (this.isSome()) {
      fn(this.cloneValue())
    }
    return this
  }

  /**
   * Validates a Some Option's value against `validator`. If
   * `validator` passes (returns `true`) then we return
   * the same Option. Otherwise, we return a None Option.
   *
   * All operations are bypassed if Option is None.
   *
   * @example
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.valueOrCompute(() => 200) // `200`
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.valueOrCompute(() => 200) // `100`
   */
  validate(
    validator: (value: V) => boolean,
  ): Option<V> {
    if (this.isNone()) {
      return this
    }

    if (validator(this.cloneValue())) {
      return this
    }

    return Option.none()
  }

  valueOr(value: V): V {
    return this.isSome() ? this.cloneValue() : value
  }

  /**
   * Returns the value if Some, otherwise, returns `undefined`.
   * This is useful for retreiving Option values and passing
   * them to functions with optional parameters.
   *
   * @example
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.valueOrUndefined() // `undefined`
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.valueOrUndefined() // `100`
   */
  valueOrUndefined() {
    return this.isSome() ? this.cloneValue() : undefined
  }

  /**
   * Returns the value if Some, otherwise, returns the result
   * of calling `computeValue`.
   *
   * @example
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.valueOrCompute(() => 200) // `200`
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.valueOrCompute(() => 200) // `100`
   */
  valueOrCompute(computeValue: () => V): V {
    return this.isSome() ? this.cloneValue() : computeValue()
  }

  valueOrError(fn: (option: Option<V>) => never): V {
    if (this.isNone()) {
      fn(this.clone())
    }

    return this.cloneValue()
  }
}
