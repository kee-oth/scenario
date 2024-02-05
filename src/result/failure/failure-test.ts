import { describe, expect, it, vi } from 'vitest'

import type { Result } from '../'
import { Failure, failure, success } from '../'

if (import.meta.vitest) {
  // Using an object in order to test for referential equality
  type FailureValue = { number: number }
  const failureValue: FailureValue = { number: 0 }
  type SuccessValue = 'SUCCESS_1' | 'SUCCESS_2'
  const successValue1: SuccessValue = 'SUCCESS_1'

  const getResult = (kind: 'failure' | 'success'): Result<SuccessValue, FailureValue> => {
    return kind === 'failure' ? failure(failureValue) : success(successValue1)
  }

  describe('the Failure class', () => {
    it('should identify as a Failure', () => {
      // Test
      const aResult = getResult('failure')

      // Assert
      expect(aResult instanceof Failure).toBe(true)
      expect(aResult.isFailure()).toEqual(aResult instanceof Failure)
      expect(aResult.isFailure()).toEqual(true)
    })

    it('should not identify as a Success', () => {
      // Test
      const aResult = getResult('failure')

      // Assert
      expect(aResult.isSuccess()).toEqual(false)
    })

    it('should not be mappable', () => {
      // Setup
      const aResult = getResult('failure')

      // Test
      const nextFailure = aResult.map((value) => value)

      // Assert
      expect(nextFailure.value).toEqual(failureValue)
    })

    it('should not be async mappable', async () => {
      // Setup
      const aResult = getResult('failure')

      // Test
      const nextFailure = await aResult.mapAsync(() => Promise.resolve(success(10)))

      // Assert
      expect(nextFailure.value).toEqual(failureValue)
    })

    it('should be mappable via `mapFailure`', () => {
      // Setup
      const aResult = getResult('failure')

      // Test
      const nextFailure = aResult.mapFailure((value) => ({ number: value.number + 5 }))

      // Assert
      // Test that the Failure itself is a new instance
      expect(nextFailure.value).not.toEqual(failureValue)
      // Test new value

      // We know this is a Failure but we have to check so  TypeScript can correctly infer it
      if (nextFailure.isFailure()) {
        expect(nextFailure.value.number).toEqual(5)
      } else {
        throw new Error('Failure should not be a Success')
      }
    })

    it('should be reduceable', () => {
      // Setup
      const aResult = getResult('failure')

      // Test
      const result = aResult.reduce((result, context) => {
        if (result.isSuccess()) {
          return context + 10
        } else {
          return context - 10
        }
      }, 0)

      // // Assert
      expect(result).toEqual(-10)
    })

    it('should be recoverable', () => {
      // Setup
      const aResult = getResult('failure')

      // Test
      const newSuccess = aResult.recover((value) => {
        return value.number === 0 ? 'SUCCESS_1' : 'SUCCESS_2'
      })

      // Assert
      expect(newSuccess.isSuccess()).toEqual(true)
      expect(newSuccess.value).toEqual('SUCCESS_1')
    })

    it('should be debuggable when `debug` should run', () => {
      // Setup
      const callback = vi.fn()
      const someResult = failure(0)

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
      const someResult = failure(0)

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
      const someResult = failure(0)

      // Test
      someResult.tap(callback)

      // Assert
      expect(callback).toHaveBeenCalledOnce()
      expect(callback).toHaveBeenCalledWith(someResult)
    })

    it('should be Failure tappable', () => {
      // Setup
      const callback = vi.fn()
      const someResult = getResult('failure')

      // Test
      someResult.tapFailure(callback)

      // Assert
      expect(callback).toHaveBeenCalledOnce()
    })

    it('should not be Success tappable', () => {
      // Setup
      const callback = vi.fn()
      const someResult = getResult('failure')

      // Test
      someResult.tapSuccess(callback)

      // Assert
      expect(callback).not.toHaveBeenCalled()
    })
  })
}
