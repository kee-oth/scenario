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

  static from<T = never>(value: T) {
    return Option.some(value)
  }

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

  reduce<C, R>(
    reducer: (context: C, result: Option<V>) => R,
    context: C,
  ): R {
    return reducer(context, this.clone())
  }

  /*
  `runEffect` lets you access the `Option` without
  doing anything to the `Option` itself.

  This is similar to `debug` but `tap` will always
  run. This is useful for logging or other necessary
  side-effect work.
  */
  runEffect(effect: (result: Option<V>) => void): Option<V> {
    effect(this.clone())
    return this
  }

  runEffectWhenNone(fn: () => void): Option<V> {
    if (this.isNone()) {
      fn()
    }
    return this
  }

  /*
    `runEffectWhenSome` lets you access the `value` of a `Some`
    without doing anything to anything to the `Some` itself.
  */
  runEffectWhenSome(fn: (value: V) => void): Option<V> {
    if (this.isSome()) {
      fn(this.cloneValue())
    }
    return this
  }

  // TODO: test
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

  valueOrCompute(fn: () => V): V {
    return this.isSome() ? this.cloneValue() : fn()
  }

  valueOrError(fn: (option: Option<V>) => never): V {
    if (this.isNone()) {
      fn(this.clone())
    }

    return this.cloneValue()
  }
}
