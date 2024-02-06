// Using `isSuccess` lets us be able to pass `undefined` to
// `successValue` and still understand that the user is looking
// for a Success

export class Option<V> {
  private currentValue: V
  // private currentValue: NonNullable<V> // is this possible to do? We'd have to keep _some_ value in here...

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

    return Option.none<NewV>() // Need to return a new None so that `V` can get reassigned to `NewV`
  }

  recover(
    recoverer: () => V,
  ): Option<V> {
    if (this.isSome()) {
      return this
    }

    return Option.some(recoverer())
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

  valueOr(value: V): V {
    return this.isSome() ? this.cloneValue() : value
  }

  valueOrCompute(fn: () => V): V {
    return this.isSome() ? this.cloneValue() : fn()
  }

  // useful to just cancel the program, this can be accomplished via `valueOrCompute` though
  // but we did include `from` as a convenience method that helps relate developer intent
  valueOrError(fn: (option: Option<V>) => never): V {
    if (this.isNone()) {
      fn(this.clone())
    }

    return this.cloneValue()
  }

  // This is a way to shortcircuit and just throw an error when None
  // Can continue along the path otherwise. Kinda like Rust's `?`
  // that sends errors upward
  orError(fn: (option: Option<V>) => never): Option<V> {
    if (this.isNone()) {
      fn(this.clone())
    }

    return this
  }
}

// const aNone = Option.some(3)
// .valueOr(4)

// Docs notes, unlike Result, Option is opinionated about what it'll accept as a value for Some
// this means that you can call `Option.some(someValue)` and potentially get a None. This is
// Result where you can define a Success to hold any value.

// Should this be the case? Probably. Just the method name is weird, so lets offer `.from` as a convenience API
// encourage to use `some` where it's cleary a Some, `none` where it's clearly a `none` and `from` when it's a
// runtime/dynamic thing

// if (aNone.isSome()) {
//   aNone.value() // TODO: this shouldn't be null after we check?
// }

// if (aNone.isNone()) {
//   aNone.value() // this works like we want (but maybe it should identify as never?)
// }
