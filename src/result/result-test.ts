import { describe, expect, it, vi } from 'vitest'

import { Result } from '.'

if (import.meta.vitest) {
  describe('the Result class', () => {
    it('should identify as a Result', () => {
      const failureResult = Result.failure(0)
      const successResult = Result.success(0)

      expect(failureResult instanceof Result).toBe(true)
      expect(successResult instanceof Result).toBe(true)
    })

    it('should identify a Failure as a Failure', () => {
      const failureResult = Result.failure(0)

      expect(failureResult.isFailure()).toBe(true)
    })

    it('should identify a Success as a Success', () => {
      const successResult = Result.success(null)

      expect(successResult.isSuccess()).toBe(true)
    })

    it('should be mappable if a Success', () => {
      const successResult = Result.success(0)

      const newResult = successResult.map((successValue) => successValue + 10)

      expect(newResult.isSuccess()).toBe(true)
      expect(newResult.value()).toBe(10)
    })

    it('should not be mappable if a Failure', () => {
      const failureResult = Result.failure(0)

      const newResult = failureResult.map((successValue) => successValue + 10)

      expect(newResult.isFailure()).toBe(true)
      expect(newResult.value()).toBe(0)
    })

    it('should not be failure mappable if a Success', () => {
      const successResult = Result.success(0)

      const newResult = successResult.mapFailure((failureValue) => failureValue + 10)

      expect(newResult.isSuccess()).toBe(true)
      expect(newResult.value()).toBe(0)
    })

    it('should be failure mappable if a Failure', () => {
      const failureResult = Result.failure(0)

      const newResult = failureResult.mapFailure((failureValue) => failureValue + 10)

      expect(newResult.isFailure()).toBe(true)
      expect(newResult.value()).toBe(10)
    })

    it('should be recoverable if a Failure', () => {
      // these erros are because TS knows this is a failure and so S = never. makes sense here.
      // we should make TS not know if failureResult is a "Failure" or not, then this should type check
      const failureResult = Result.failure<number, number>(10)

      const successResult = failureResult.recover((failureValue) => failureValue + 10)

      expect(successResult.isSuccess()).toBe(true)
      expect(successResult.value()).toBe(20)
    })

    it('should not be recoverable if a Success', () => {
      const successResult = Result.success(0)

      const newSuccessResult = successResult.recover((failureValue) => failureValue + 10)

      expect(newSuccessResult.isSuccess()).toBe(true)
      expect(newSuccessResult.value()).toBe(0)
    })

    it('should be reduceable if a Success', () => {
      const successResult = Result.success(0)

      const reducedValue = successResult.reduce((context, result) => context + result.value(), 100)

      expect(reducedValue).toBe(100)
    })

    it('should be reduceable if a Failure', () => {
      const failureResult = Result.failure(0)

      const reducedValue = failureResult.reduce((context, result) => context + result.value(), 100)

      expect(reducedValue).toBe(100)
    })

    it('should should allow access to the value', () => {
      const failureResult = Result.failure(0)
      const successResult = Result.success(0)

      const failureValue = failureResult.value()
      const successValue = successResult.value()

      expect(failureValue).toBe(0)
      expect(successValue).toBe(0)
    })

    it('should should allow access to the success value when given a fallback value', () => {
      // Need to type here, or TS will correctly point out that with a `never` as the
      // default, we won't be able to switch to having another type for the `S` generic
      // So we need to tell TS, "hey this can actually be something" when we first
      // initialize the Failure
      const failureResult = Result.failure<number, number>(0)
      const successResult = Result.success(0)

      const failureValue = failureResult.valueOr(10)
      const successValue = successResult.valueOr(10)

      expect(failureValue).toBe(10)
      expect(successValue).toBe(0)
    })

    it('should should allow access to the success value when given a function that returns with a fallback value', () => {
      // Need to type here, or TS will correctly point out that with a `never` as the
      // default, we won't be able to switch to having another type for the `S` generic
      // So we need to tell TS, "hey this can actually be something" when we first
      // initialize the Failure
      const failureResult = Result.failure<number, string>(0)
      const successResult = Result.success(0)

      const failureValue = failureResult.valueOrCompute(() => '10')
      const successValue = successResult.valueOrCompute(() => 10)

      expect(failureValue).toBe('10')
      expect(successValue).toBe(0)
    })

    it('should be debuggable when `debug` should run', () => {
      // Setup
      const callback = vi.fn()
      const someFailure = Result.failure(0)
      const someSuccess = Result.success(0)

      // Test
      someFailure.debug(true, callback)
      someFailure.debug(() => true, callback)
      someSuccess.debug(true, callback)
      someSuccess.debug(() => true, callback)

      // Assert
      expect(callback).toHaveBeenCalledTimes(4)
    })

    it('should not be debuggable when `debug` should not run', () => {
      // Setup
      const callback = vi.fn()
      const someFailure = Result.failure(0)
      const someSuccess = Result.success(0)

      // Test
      someFailure.debug(false, callback)
      someFailure.debug(() => false, callback)
      someSuccess.debug(false, callback)
      someSuccess.debug(() => false, callback)

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

    it('should be Success tappable when a Success', () => {
      // Setup
      const callback = vi.fn()
      const someResult = Result.success(0)

      // Test
      someResult.tapSuccess(callback)

      // Assert
      expect(callback).toHaveBeenCalledOnce()
    })

    it('should  be Failure tappable when a Failure', () => {
      // Setup
      const callback = vi.fn()
      const someResult = Result.failure(0)

      // Test
      someResult.tapFailure(callback)

      // Assert
      expect(callback).toHaveBeenCalledOnce()
    })

    it('should not be Success tappable when a Failure', () => {
      // Setup
      const callback = vi.fn()
      const someResult = Result.failure(0)

      // Test
      someResult.tapSuccess(callback)

      // Assert
      expect(callback).not.toHaveBeenCalled()
    })

    it('should not be Failure tappable when a Success', () => {
      // Setup
      const callback = vi.fn()
      const someResult = Result.success(0)

      // Test
      someResult.tapFailure(callback)

      // Assert
      expect(callback).not.toHaveBeenCalled()
    })
  })
}
