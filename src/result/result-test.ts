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

    it('should be able to create a Result from nullish value', () => {
      const getTestData = (returnNull: boolean) => returnNull ? null : 0
      // Using `null` as value given to `fromNullish`
      const failureResult1 = Result.fromNullish(getTestData(true), 1, (data) => data ?? null)

      // Using `undefined` as value given to `fromNullish`
      const failureResult2 = Result.fromNullish(getTestData(true), 1, (data) => data ?? undefined)

      const successResult = Result.fromNullish(getTestData(false), 1, (data) => data ?? null)

      expect(successResult.isSuccess()).toBe(true)
      expect(successResult.valueOr(1)).toBe(0)

      expect(failureResult1.isFailure()).toBe(true)
      expect(failureResult1.value()).toBe(1)
      expect(failureResult2.isFailure()).toBe(true)
      expect(failureResult2.value()).toBe(1)
    })

    it('should allow accessing the value with a provided fallback value', () => {
      const fallbackValue = Result.failure<number, number>(0).valueOr(1)
      const successValue = Result.success(0).valueOr(2)

      expect(fallbackValue).toBe(1)
      expect(successValue).toBe(0)
    })

    it('should allow accessing the value with a provided function returning a fallback value', () => {
      const fallbackValue = Result.failure<number, number>(0).valueOrCompute(() => 1)
      const successValue = Result.success(0).valueOrCompute(() => 2)

      expect(fallbackValue).toBe(1)
      expect(successValue).toBe(0)
    })

    it('should allow validating the success value to continue as a Success', () => {
      const failureResult = Result.failure<number, number>(0)
      const successResult = Result.success<number, number>(0)

      // Successful validation
      const failureResultSuccessfulValidation = failureResult.validate((successValue) => successValue === 0, 10)
      expect(failureResultSuccessfulValidation.isFailure()).toBe(true)
      expect(failureResultSuccessfulValidation.value()).toBe(0)

      const successResultSuccessfulValidation = successResult.validate((successValue) => successValue === 0, 10)
      expect(successResultSuccessfulValidation.isSuccess()).toBe(true)
      expect(successResultSuccessfulValidation.value()).toBe(0)

      // Unsuccessful validation
      const failureResultFailedValidation = failureResult.validate((successValue) => successValue === 0, 10)
      expect(failureResultFailedValidation.isFailure()).toBe(true)
      expect(failureResultFailedValidation.value()).toBe(0)

      const successResultFailedValidation = successResult.validate((successValue) => successValue > 0, 10)
      expect(successResultFailedValidation.isSuccess()).toBe(false)
      expect(successResultFailedValidation.value()).toBe(10)
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
      const failureResult = Result.failure<number, number>(0)
      const successResult = Result.success(0)

      const failureValue = failureResult.valueOr(10)
      const successValue = successResult.valueOr(10)

      expect(failureValue).toBe(10)
      expect(successValue).toBe(0)
    })

    it('should should allow access to the success value when given a function that returns with a fallback value', () => {
      const failureResult = Result.failure<number, string>(0)
      const successResult = Result.success(0)

      const failureValue = failureResult.valueOrCompute(() => '10')
      const successValue = successResult.valueOrCompute(() => 10)

      expect(failureValue).toBe('10')
      expect(successValue).toBe(0)
    })

    it('should be able to create a Result depending on validation result', () => {
      const failureResult = Result.fromValidator((valueIfSuccess) => {
        return valueIfSuccess !== 0
      }, 0, 100)

      const successResult = Result.fromValidator((valueIfSuccess) => {
        return valueIfSuccess === 0
      }, 0, 100)

      expect(failureResult.isFailure()).toBe(true)
      expect(failureResult.value()).toBe(100)
      expect(successResult.isSuccess()).toBe(true)
      expect(successResult.value()).toBe(0)
    })

    it('should be errorable when Failure', () => {
      const result = Result.failure(0)

      const errorableFunction = () => result.valueOrError(() => {
        throw new Error('Some error!')
      })

      const errorableFunction2 = () => result.orError(() => {
        throw new Error('Some error!')
      })

      expect(errorableFunction).toThrowError()
      expect(errorableFunction2).toThrowError()
    })

    it('should not be errorable when Success', () => {
      const result = Result.success(0)

      const value = result.valueOrError(() => {
        throw new Error('Some error!')
      })

      const successResult = result.orError(() => {
        throw new Error('Some error!')
      })

      expect(value).toBe(0)
      expect(successResult.isSuccess()).toBe(true)
      expect(successResult).toEqual(result)
    })

    it('should allow creation from throwable functions', () => {
      const throwableFunction = (shouldError: boolean): number | never => {
        if (shouldError) {
          throw new Error('Some error!')
        }

        return 0
      }
      const failureResult = Result.fromError(() => throwableFunction(true), 10)
      const someResult = Result.fromError(() => throwableFunction(false), 20)

      expect(failureResult.isFailure()).toBe(true)
      expect(failureResult.value()).toBe(10)
      expect(someResult.isSuccess()).toBe(true)
      expect(someResult.value()).toBe(0)
    })

    it('should be inspectable when `inspect` should run', () => {
      const callback = vi.fn()
      const someFailure = Result.failure(0)
      const someSuccess = Result.success(0)

      someFailure.inspect(true, callback)
      someFailure.inspect(() => true, callback)
      someSuccess.inspect(true, callback)
      someSuccess.inspect(() => true, callback)

      expect(callback).toHaveBeenCalledTimes(4)
    })

    it('should not be inspectable when `inspect` should not run', () => {
      const callback = vi.fn()
      const failureResult = Result.failure(0)
      const successResult = Result.success(0)

      failureResult.inspect(false, callback)
      failureResult.inspect(() => false, callback)
      successResult.inspect(false, callback)
      successResult.inspect(() => false, callback)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should be able to run an effect', () => {
      const callback = vi.fn()
      const result = Result.failure(0)

      result.runEffect(callback)

      expect(callback).toHaveBeenCalledOnce()
    })

    it('should be able to run an effect only when a Success', () => {
      const callback = vi.fn()
      const result = Result.success(0)

      result.runEffectWhenSuccess(callback)

      expect(callback).toHaveBeenCalledOnce()
    })

    it('should be able to run an effect only when a Failure', () => {
      const callback = vi.fn()
      const result = Result.failure(0)

      result.runEffectWhenFailure(callback)

      expect(callback).toHaveBeenCalledOnce()
    })

    it('should be able to not run an effect when a Failure', () => {
      const callback = vi.fn()
      const result = Result.failure(0)

      result.runEffectWhenSuccess(callback)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should be able to not run an effect when a Success', () => {
      const callback = vi.fn()
      const result = Result.success(0)

      result.runEffectWhenFailure(callback)

      expect(callback).not.toHaveBeenCalled()
    })
  })
}
