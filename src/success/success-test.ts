import { describe, expect, it, vi } from 'vitest'

import type { Result } from '../scenario'
import { Success, failure, success } from '../scenario'

if (import.meta.vitest) {
  // Using an object in order to test for referential equality
  type SuccessValue = { number: number }
  const successValue: SuccessValue = { number: 0 }
  type FailureValue = 'FAILURE_1' | 'FAILURE_2'
  const failureValue1: FailureValue = 'FAILURE_1'

  const getResult = (kind: 'failure' | 'success'): Result<SuccessValue, FailureValue> => {
    return kind === 'failure' ? failure(failureValue1) : success(successValue)
  }

  describe('the Success class', () => {
    it('should be able to identify itself as a Success', () => {
      // Test
      const aResult = getResult('success')

      // Assert
      expect(aResult instanceof Success).toBe(true)
      expect(aResult.isSuccess()).toEqual(aResult instanceof Success)
    })

    it('should identify as a Success', () => {
      // Test
      const aResult = getResult('success')

      // Assert
      expect(aResult.isSuccess()).toEqual(true)
    })

    it('should not identify as a Failure', () => {
      // Test
      const aResult = getResult('success')

      // Assert
      expect(aResult.isFailure()).toEqual(false)
    })

    it('should be mappable', () => {
      // Setup
      const aResult = getResult('success')

      // Test
      const nextSuccess = aResult.map((value) => value.number + 5)

      // Assert
      if (nextSuccess.isSuccess()) {
        expect(nextSuccess.value).toBe(5)
      } else {
        throw new Error('Success should not be a Failure')
      }
    })

    it('should be async mappable', async () => {
      // Setup
      const aResult = getResult('success')

      // Test
      const nextSuccess = await aResult.mapAsync(() => Promise.resolve(success(10)))

      // Assert
      if (nextSuccess.isSuccess()) {
        expect(nextSuccess.value).toEqual(10)
      } else {
        throw new Error('Success should not be a Failure')
      }
    })

    it('should not be mappable via `mapFailure`', () => {
      // Setup
      const aResult = getResult('success')

      // Test
      const nextSuccess = aResult.mapFailure(() => 5)

      // Assert
      if (nextSuccess.isSuccess()) {
        expect(nextSuccess.value).not.toBe(5)
      } else {
        throw new Error('Success should not be a Failure')
      }
    })

    it('should be reduceable', () => {
      // Setup
      const aResult = getResult('success')

      // Test
      const result = aResult.reduce((result, context) => {
        if (result.isSuccess()) {
          return context + 10
        } else {
          return context - 10
        }
      }, 0)

      // // Assert
      expect(result).toEqual(10)
    })

    it('should not be recoverable', () => {
      // Setup
      const aResult = getResult('success')

      // Test
      const newSuccess = aResult.recover<SuccessValue>(() => {
        return {
          number: 10,
        }
      })

      // Assert
      expect(newSuccess.isSuccess()).toEqual(true)
      expect(newSuccess.value.number).toEqual(0)
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
        result.isSuccess()
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

    it('should be Success tappable', () => {
      // Setup
      const callback = vi.fn()
      const someResult = getResult('success')

      // Test
      someResult.tapSuccess(callback)

      // Assert
      expect(callback).toHaveBeenCalledOnce()
    })

    it('should not be Failure tappable', () => {
      // Setup
      const callback = vi.fn()
      const someResult = getResult('success')

      // Test
      someResult.tapFailure(callback)

      // Assert
      expect(callback).not.toHaveBeenCalled()
    })
  })
}
