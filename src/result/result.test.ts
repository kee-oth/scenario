import { describe, expect, it, vi } from 'vitest'
import { Failure, Result, Success } from './'

describe('the Result class', () => {
  it('can create a Failure', () => {
    // Setup

    // Test
    const newFailure = Result.failure(0)

    // Assert
    expect(newFailure instanceof Failure).toEqual(true)
  })
  it('can create a Success', () => {
    // Setup

    // Test
    const newSuccess = Result.success(0)

    // Assert
    expect(newSuccess instanceof Success).toEqual(true)
  })
  it('can create a Result', () => {
    // Setup

    // Test
    const newFailure = Result.failure(0)
    const newSuccess = Result.success(0)

    // Assert
    expect(newFailure instanceof Result).toEqual(true)
    expect(newSuccess instanceof Result).toEqual(true)
  })
  it('should be debuggable when `debug` should run', () => {
    // Setup
    const callback = vi.fn()
    const someResult = Result.failure(0)

    // Test
    someResult.debug(true, callback)
    someResult.debug(() => true, callback)

    // Assert
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(someResult)
  })
  it('should not be debuggable when `debug` should not run', () => {
    // Setup
    const callback = vi.fn()
    const someResult = Result.failure(0)

    // Test
    someResult.debug(false, callback)
    someResult.debug(() => false, callback)
    someResult.debug(() => true, (result) => {
      result.isFailure()
    })

    // Assert
    expect(callback).not.toHaveBeenCalled()
  })
  it('should be tappable', () => {
    // Setup
    const callback = vi.fn()
    const someResult = Result.failure(0)

    // Test
    someResult.tap(callback)

    // Assert
    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith(someResult)
  })
})
