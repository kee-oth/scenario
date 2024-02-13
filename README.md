# Scenario

## 🚧 Work in progress! 🚧

Scenario's API is subject to change.

Please check back later to see the improvements. And note that this Readme currently acts as the official and only set of documentation.

Please open an issue if you want to

* request a feature
* request documentation clarification
* report a bug

## What is Scenario?

Scenario is a Result and Option type library that lets you safely handle potential failures and abscense of values within you JavaScript or TypeScript application.

Scenario has 0 dependencies and is very small (less than 1kb!).

Scenario is useful for both TypeScript _and_ JavaScript projects because of its runtime functionality and semantics.

## Installation
```bash
npm add @keeoth/scenario
yarn add @keeoth/scenario
pnpm add @keeoth/scenario
```

### API Reference

Please explore the [API Reference at Stackblitz](https://stackblitz.com/edit/typescript-fbykvu?devToolsHeight=100&file=index.ts) for a full picture of the library and usage (work in progress!).

### Why should I use it?

Scenario's Option and Result types will help you avoid being in unexpected situations like accessing values that don't exist (or shouldn't exist) or treating some computation's result as a success when it really is a failure.

A lot of similar projects offer their Result or Option type as a type alias for a TypeScript union. Something like this:

```ts
type Result<T, U> = Success<T> | Failure<U>
type Option<V> = Some<V> | None
```

This strategy has the unfortunate drawback that Intellisense isn't guaranteed to show you the type alias – which can lead to noisy types.

I.e. you may often see

```ts
Success<MySuccessType> | Failure<MyFailureType>
// and
Some<MySomeType> | None
```

instead of
```ts
Result<MySuccessType, MyFailureType>
// and
Option<MySomeType>
```

Scenario's Result and Option types are JavaScript classes so they have runtime semantics. This means you'll always see the more concise typing of
```ts
Result<MySuccessType, MyFailureType>
// and
Option<MySomeType>
```

## IMPORTANT

For best ergonomics and typing, please ensure that your `tsconfig.json` file has these settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

### Option

An Option represent the potential abscense of a value. They provide safe ways for you to access and operate on these potentially absent values.

An Option representing a guaranteed value is called a Some.
An Option representing an absent value is called a None.

#### Examples

Please see the source code and test files for further documentation usage examples.

##### Creating a Some Option
```ts
// Options.from will be a Some if the passed in
// value is anything but `undefined` or `null`.
// Otherwise, it will be a None.
const option = Option.from(0) // `option` is a Some
// or Option.some(0)

const newOption = option.map((value) => value + 10)

// Check if newOption is a Some
newOption.isSome() // true

// Check if newOption is a None
newOption.isNone() // false

// In case of a Some, retrieve the value.
// Otherwise, in case of a None, retrieve
// the fallback (`20`).
newOption.valueOr(20) // 10

// In case of a Some, retrieve the value.
// Otherwise, in case of a None, retrieve
// the result of the passed in function.
newOption.valueOr(() => 20) // 10
```

##### Creating a None Option
```ts
const option = Option.from(null) // `option` is a Nome
// or Option.none()

const newOption = option.map((value) => value + 10)

newOption.isSome() // false

// Check if newOption is a None
newOption.isNone() // true

// In case of a Some, retrieve the value.
// Otherwise, in case of a None, retrieve
// the fallback (`20`).
newOption.valueOr(20) // 20

// In case of a Some, retrieve the value.
// Otherwise, in case of a None, retrieve
// the result of the passed in function.
newOption.valueOr(() => 20) // 20
```

##### Returning an Option from a function
```ts
const getFirstItem = <T>(items: T[]): Option<T> => {
  const [firstItem] = items
  return Option.from(firstItem)
}

getFirstItem([]) // None
getFirstItem([1]) // Some
```

### Result

An Result represent the potential success or failure of an operation. They provide safe ways for you to access and operate on these potentially absent values.

A Result representing a success is called a Success.
A Result representing a failure is called a Failure.

#### Examples

Please see the source code and test files for further documentation usage examples.

##### Creating a Success Result
```ts
// Results.success will create a Success
// no matter what value you pass to it.
const result = Result.success(0) // `result` is a Success
// or Result.some(0)

const newResult = result.map((value) => value + 10)

// Check if newResult is a Success
newResult.isSuccess() // true

// Check if newResult is a None
newResult.isFailure() // false

// In case of a Success, retrieve the value.
// Otherwise, in case of a Failure, retrieve
// the fallback (`20`).
newResult.valueOr(20) // 10

// In case of a Success, retrieve the value.
// Otherwise, in case of a Failure, retrieve
// the result of the passed in function.
newResult.valueOrCompute(() => 20) // 10
```

##### Creating a Failure Result
```ts
// Results.failure will create a Failure
// no matter what value you pass to it.
const result = Result.failure('SOME_FAILURE') // `result` is a Failure

const newResult = result.map((value) => value + 10)

newResult.isSuccess() // false

// Check if newResult is a Failure
newResult.isFailure() // true

// In case of a Success, retrieve the value.
// Otherwise, in case of a Failure, retrieve
// the fallback (`20`).
newResult.valueOr(20) // 20

// In case of a Success, retrieve the value.
// Otherwise, in case of a Failure, retrieve
// the result of the passed in function.
newResult.valueOrCompute(() => 20) // 20
```

##### Returning an Result from a function
```ts
type FailureMessage = string

const getFirstItem = <T>(items: T[]): Result<T, FailureMessage> => {
  const [firstItem] = items

  if (firstItem) {
    return Result.success(firstItem)
  }

  return Result.failure('UNABLE_TO_FIND_FIRST_ITEM')
}

const failureResult = getFirstItem([])
failureResult.value() // "UNABLE_TO_FIND_FIRST_ITEM"

const successResult = getFirstItem([1]) // Success
successResult.value() // 1
```
