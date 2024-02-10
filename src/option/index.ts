/**
 * The Option class represents the prescense or absence of a value.
 * Use it when you want to safely work with data that _may_ or
 * _may not_ be there.
 * @class
 */
export class Option<V = never> {
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
   * #### Usage
   * ```ts
   * const noneOption = Option.from(null)
   *
   * const someOption = Option.from(100)
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Fstatic-methods%2Ffrom.ts | View example on StackBlitz}
   */
  static from<T = never>(value?: T): T extends null | undefined ? Option<never> : Option<T> {
    if (value === null || value === undefined) {
      return new Option<never>() as T extends null | undefined ? Option<never> : Option<T>
    }
    return new Option<T>(value) as T extends null | undefined ? Option<never> : Option<T>
  }

  /**
   * Creates an Option given a function which can throw.
   *
   * If `throwable` `throw`s or returns `undefined` or `null`,
   * a None will be created and returned.
   * Otherwise, a Some containing the return value of `throwable` will be created and returned.
   *
   * #### Usage
   * ```ts
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
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Fstatic-methods%2FfromError.ts | View example on StackBlitz}
   */
  static fromError<T>(throwable: (() => T | never)): Option<T> {
    try {
      return Option.some(throwable())
    } catch {
      return Option.none()
    }
  }

  /**
   * Creates a None Option.
   *
   * Use this if you want to be explicit about creating a None.
   *
   * #### Usage
   * ```ts
   * const noneOption = Option.none()
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Fstatic-methods%2Fnone.ts | View example on StackBlitz}
   */
  static none<T = never>() {
    return new Option<T>()
  }

  /**
   * Creates a Some Option given a non-nullish value (a value not `undefined` or `null`).
   * Otherwise, a None is created.
   *
   * Use this if you want to be explicit about creating a Some.
   *
   * #### Usage
   * ```ts
   * const someOption = Option.some()
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Fstatic-methods%2Fsome.ts | View example on StackBlitz}
   */
  static some<T = never>(value: T) {
    return new Option<T>(value)
  }

  /**
   * Let's you inspect the Option without allowing you to change it.
   * You can pass in a boolean or function returning a boolean to
   * programmatically control when to run `inspect`. This is useful
   * for running debugging operations in certain environments.
   *
   * #### Usage
   * ```ts
   * const option = Option.from(0)
   * option.inspect(true, (option) => inspectFn(option)) // will run
   * option.inspect(() => true, (option) => inspectFn(option)) // will run
   *
   * option.inspect(false, (option) => inspectFn(option)) // won't run
   * option.inspect(() => false, (option) => inspectFn(option)) // won't run
   *
   * function inspectFn(option) {
   *  console.log(option.valueOrUndefined())
   * }
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2Finspect.ts | View example on StackBlitz}
   */
  inspect(
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

  /**
   * Let's you check if an Option is a Some. Useful for control flow decisions.
   *
   * #### Usage
   * ```ts
   * const noneOption = Option.from(null)
   * noneOption.isSome() // false
   *
   * const someOption = Option.from(0)
   * someOption.isSome() // true
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2FisSome.ts | View example on StackBlitz}
   */
  isSome(): this is Option<NonNullable<V>> {
    return this.currentValue !== null
  }

  /**
   * Let's you check if an Option is a None. Useful for control
   * flow decisions.
   *
   * #### Usage
   * ```ts
   * const noneOption = Option.from(null)
   * noneOption.isNone() // true
   *
   * const someOption = Option.from(0)
   * someOption.isNone() // false
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2FisNone.ts | View example on StackBlitz}
   */
  isNone(): this is Option<never> {
    return this.currentValue === null
  }

  /**
   * Map allows access to the value if Option is a Some. A new
   * Some Option containing the result of `mapper` is returned.
   * This is a no-op if Option is a None.
   *
   * #### Usage
   * ```ts
   * const option = Option.from(0)
   *
   * const newOption = option.map((value) => value + 10)
   *
   * newOption.isSome() // true
   * newOption.valueOr(100) // 10
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2Fmap.ts | View example on StackBlitz}
   */
  // TODO: what should happen when a nullish value is returned here?
  map<NewV>(mapper: (value: V) => NewV): Option<NewV> {
    if (this.isSome()) {
      return Option.some(mapper(this.cloneValue()))
    }

    return Option.none<NewV>()
  }

  /**
   * Offers a way to throw an error if Option is a None.
   *
   * This is useful for immediately stopping execution of
   * an Option's chain of methods.
   *
   * #### Usage
   * ```ts
   * const noneOption = Option.from(null);
   *
   * try {
   *   noneOption.orThrowError(new Error('Error occurred!'));
   * } catch (error) {
   *   console.error(error); // Will run
   * }
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2ForThrowError.ts | View example on StackBlitz}
   */
  orThrowError(errorToThrow: Error): Option<V> {
    if (this.isNone()) {
      throw errorToThrow
    }

    return this
  }

  /**
   * Offers a way to switch from a None to a Some of the same type.
   *
   * #### Usage
   * ```ts
   * const option = Option.none<number>()
   *
   * const newOption = option.recover(() => 10)
   *
   * newOption.isSome() // true
   * newOption.valueOr(100) // 10
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2Frecover.ts | View example on StackBlitz}
   */
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
   * callback (`reducer`).
   *
   * This useful for switching the type of the Option value when
   * trying to transform from a None to a Some.
   *
   * Though you could choose to close-over values instead of passing
   * them in as `context`, doing so makes it more difficult to test
   * the functions you may need to pass as `reducer` as they are no
   * longer pure functions.
   *
   * #### Usage
   * ```ts
   * // None usage
   * const noneOption = Option.from<never>(null)
   * noneOption.reduce((context, value) => !!(context && value), 100) // false
   *
   * // Some usage
   * const someOption = Option.some(10)
   * someOption.reduce((context, value) => !!(context && value), 100) // true
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2Freduce.ts | View example on StackBlitz}
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
   * #### Usage
   * ```ts
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.runEffect((value) => sendToLog(value)) // will run
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.runEffect((value) => sendToLog(value)) // will run
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2FrunEffect.ts | View example on StackBlitz}
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
   * #### Usage
   * ```ts
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.runEffectWhenNone((value) => sendToLog(value)) // will run
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.runEffectWhenNone((value) => sendToLog(value)) // won't run
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2FrunEffectWhenNone.ts | View example on StackBlitz}
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
   * #### Usage
   * ```ts
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.runEffectWhenSome((value) => sendToLog(value)) // won't run
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.runEffectWhenSome((value) => sendToLog(value)) // will run
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2FrunEffectWhenSome.ts | View example on StackBlitz}
   */
  runEffectWhenSome(fn: (value: V) => void): Option<V> {
    if (this.isSome()) {
      fn(this.cloneValue())
    }
    return this
  }

  /**
   * Validates a Some's value against `validator`. If
   * `validator` passes (returns `true`) then we return
   * the same Option. Otherwise, we return a None.
   *
   * All operations are bypassed if Option is None.
   *
   * #### Usage
   * ```ts
   * // Usage with a Some
   * const someOption = Option.from(10)
   *
   * // Pass validation
   * const sameSomeOption = someOption.validate((value) => {
   *   return value > 0
   * });
   * sameSomeOption.valueOrUndefined() // 10
   *
   * // Fail validation
   * const newNoneOption = someOption.validate((value) => {
   *   return value < 0;
   * });
   * newNoneOption.isNone() // true
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2Fvalidate.ts | View example on StackBlitz}
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

    return Option.none<V>()
  }

  /**
   * Returns the value if a Some, otherwise, returns `fallback`.
   *
   * #### Usage
   * ```ts
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.valueOr(200) // `200`
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.valueOr(200) // `100`
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2FvalueOr.ts | View example on StackBlitz}
   */
  valueOr(fallback: V): V {
    return this.isSome() ? this.cloneValue() : fallback
  }

  /**
   * Returns the value if a Some, otherwise, returns `undefined`.
   * This is useful for retreiving Option values and passing
   * them to functions with optional parameters.
   *
   * #### Usage
   * ```ts
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.valueOrUndefined() // `undefined`
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.valueOrUndefined() // `100`
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2FvalueOrUndefined.ts | View example on StackBlitz}
   */
  // TODO: Figure out how to get the callsite return type to be V if and only if a Some
  // valueOrUndefined(): V extends null | undefined ? null : V {
  valueOrUndefined() {
    return (this.isSome() ? this.cloneValue() : undefined)
  }

  /**
   * Returns the value if a Some, otherwise, returns the result
   * of calling `computeFallback`.
   *
   * #### Usage
   * ```ts
   * // None usage
   * const noneOption = Option.from(null)
   * noneOption.valueOrCompute(() => 200) // `200`
   *
   * // Some usage
   * const someOption = Option.from(100)
   * someOption.valueOrCompute(() => 200) // `100`
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%2FvalueOrCompute.ts | View example on StackBlitz}
   */
  valueOrCompute(computeFallback: () => V): V {
    return this.isSome() ? this.cloneValue() : computeFallback()
  }

  /**
   * Offers a way to return the value if a Some or
   * otherwise run a throwable function if a None.
   *
   * This is useful for immediately stopping execution of
   * an Option's chain of methods if a None.
   *
   * #### Usage
   * ```ts
   * const noneOption = Option.from(null);
   *
   * try {
   *   const value = noneOption.valueOrThrowError(new Error('Error occurred!'));
   * } catch (error) {
   *   console.error(error); // Will run
   * }
   * ```
   *
   * {@link https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=Option%2Finstance-methods%valueOrThrowError.ts | View example on StackBlitz}
   */
  valueOrThrowError(errorToThrow: Error): V {
    if (this.isNone()) {
      throw errorToThrow
    }

    return this.cloneValue()
  }
}

/**
 * THOUGHTS
 * 1. try `private currentValue: Some<V> : None`
 *    This lets us check if something is a Some or None in a controlled way, independent of actual value
 *    while still preseving the original type via Option's `V` generic.
 *    This may offer typing advantages for narrowing/guarding/return types.
 * 2. should we offer `transform` specifically useful for going from Option<never> to Option<NewType>?
 *    with `reduce`, the user needs to explicitly pass back and Option. `transform` could call
 *    `Option.from(...)` with the result of a passed in function.
 * 3. Break out methods to separate folders/files and group with own tests
 *    Useful to have in separate files for linking purposes
 *    See for typing reference: https://stackoverflow.com/questions/42999765/add-a-method-to-an-existing-class-in-typescript
 * 4. Make this type correctly? `const shouldBeOptionNumber = Option.from<unknown>().recover(() => 10)`
 *    Should `from` default to `from<unknown>`, this lets users narrow the type later? Is there a good use case for this?
 * 5. Make "Recipes" section in the API Reference (or in an entirely new Stackblitz)?
 */
