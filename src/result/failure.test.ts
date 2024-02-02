import { describe, expect, it, vi } from 'vitest'
import { Failure, Result, Success } from './'

// Using an object in order to test for referential equality
type TestFailureValue = { number: number }
const testFailureValue: TestFailureValue = { number: 0 }

describe('the Failure class', () => {
  it('should be able to identify itself as a Failure', () => {
    // Test
    const newFailure = Result.failure(testFailureValue)

    // Assert
    expect(newFailure instanceof Failure).toBe(true)
    expect(newFailure.isFailure()).toEqual(newFailure instanceof Failure)
  })
  it('should identify as a Failure', () => {
    // Test
    const newFailure = Result.failure(testFailureValue)

    // Assert
    expect(newFailure.isFailure()).toEqual(true)
  })
  it('should not identify as a Success', () => {
    // Test
    const newFailure = Result.failure(testFailureValue)

    // Assert
    expect(newFailure.isSuccess()).toEqual(false)
  })
  it('should not be affected by `map`', () => {
    // Setup
    const newFailure: Result<never, TestFailureValue> = Result.failure(testFailureValue)

    // Test
    const nextFailure = newFailure.map(() => 3)

    // Assert
    expect(nextFailure.value).toEqual(testFailureValue)
  })
  it('should not be affected by `mapAsync`', async () => {
    // Setup
    const newFailure: Result<never, TestFailureValue> = Result.failure(testFailureValue)

    // Test
    const nextFailure = await newFailure.mapAsync(() => Promise.resolve(Result.success(10)))

    // Assert
    expect(nextFailure.value).toEqual(testFailureValue)
  })
  it('should be affected by `mapFailure`', () => {
    // Setup
    const newFailure: Result<never, TestFailureValue> = Result.failure(testFailureValue)

    // Test
    const nextFailure = newFailure.mapFailure((value) => ({ number: value.number + 5 }))

    // Assert
    // Test that the Failure itself is a new instance
    expect(nextFailure.value).not.toEqual(testFailureValue)
    // Test new value
    expect(nextFailure.value.number).toEqual(5)
  })
  it('should be affected by `reduce`', () => {
    // Setup
    const newFailure = Result.failure(testFailureValue)

    // Test
    const nextFailure = newFailure.reduce((value) => {
      if (value.isFailure()) {
        return 0
      }
      return 5
    })

    // Assert
    expect(newFailure.isFailure()).toEqual(true)
    // Test that the Failure itself is a new instance
    expect(nextFailure).not.toEqual(testFailureValue)
    // Test new value
    expect(nextFailure).toEqual(0)
  })
  it('should be affected by `recover`', () => {
    // Setup
    type SuccessType = 'Success 1' | 'Success 2'
    const newFailure: Result<SuccessType, TestFailureValue> = Result.failure(testFailureValue)

    // Test
    const newSuccess = newFailure.recover((value) => {
      return value.number === 0 ? 'Success 1' : 'Success 2'
    })

    // Assert
    expect(newSuccess.isSuccess()).toEqual(true)
    expect(newSuccess.value).toEqual('Success 1')
  })
})
