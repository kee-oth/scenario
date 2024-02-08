import { describe, expect, it, vi } from 'vitest'

import { Option } from '.'

if (import.meta.vitest) {
  describe('the Option class', () => {
    it('should identify as a Option', () => {
      const noneOption = Option.none()
      const someOption = Option.some(0)

      expect(noneOption instanceof Option).toBe(true)
      expect(someOption instanceof Option).toBe(true)
    })

    it('should identify a None as a None', () => {
      const noneOption = Option.none()

      expect(noneOption.isNone()).toBe(true)
    })

    it('should identify a Some as a Some', () => {
      const someOptionFromObject = Option.some({})
      const someOptionFromEmptyString = Option.some('')
      const someOptionFromZero = Option.some(0)

      expect(someOptionFromObject.isSome()).toBe(true)
      expect(someOptionFromEmptyString.isSome()).toBe(true)
      expect(someOptionFromZero.isSome()).toBe(true)
    })

    it('should instantiate a None from `null` or `undefined` using `some`', () => {
      const someOptionFromNull = Option.some(undefined)
      const someOptionFromUndefined = Option.some(undefined)

      expect(someOptionFromNull.isNone()).toBe(true)
      expect(someOptionFromUndefined.isNone()).toBe(true)
      expect(someOptionFromNull.isSome()).toBe(false)
      expect(someOptionFromUndefined.isSome()).toBe(false)
    })

    it('should instantiate a None from `null` or `undefined` using `from`', () => {
      const someOptionFromNull = Option.from(undefined)
      const someOptionFromUndefined = Option.from(undefined)

      expect(someOptionFromNull.isNone()).toBe(true)
      expect(someOptionFromUndefined.isNone()).toBe(true)
    })

    it('should allow accessing the value with a provided fallback value', () => {
      const noneValue = Option.none<number>().valueOr(1)
      const someValue = Option.some(0).valueOr(2)

      expect(noneValue).toBe(1)
      expect(someValue).toBe(0)
    })

    it('should allow accessing the value with `undefined` as a fallback value', () => {
      const noneValue = Option.none().valueOrUndefined()
      const someValue = Option.some(0).valueOrUndefined()

      const someOpt = Option.from(0)

      const thing = (huh?: number) => huh

      thing(someOpt.valueOrUndefined())

      expect(noneValue).toBe(undefined)
      expect(someValue).toBe(0)
    })

    it('should allow accessing the value with a provided function returning a fallback value', () => {
      const noneValue = Option.none<number>().valueOrCompute(() => 1)
      const someValue = Option.some(0).valueOrCompute(() => 2)

      expect(noneValue).toBe(1)
      expect(someValue).toBe(0)
    })

    it('should allow validating the success value to continue as a Success', () => {
      const noneOption = Option.none<number>()
      const someOption = Option.some(0)

      // Bypass validation with a Failure
      const failureResultSuccessfulValidation = noneOption.validate((value) => value === 0)
      expect(failureResultSuccessfulValidation.isNone()).toBe(true)
      expect(failureResultSuccessfulValidation.valueOrUndefined()).toBe(undefined)

      // Successful validation
      const successResultSuccessfulValidation = someOption.validate((value) => value === 0)
      expect(successResultSuccessfulValidation.isSome()).toBe(true)
      expect(successResultSuccessfulValidation.valueOrUndefined()).toBe(0)

      // Unsuccessful validation
      const successResultFailedValidation = someOption.validate((value) => value !== 0)
      expect(successResultFailedValidation.isSome()).toBe(false)
      expect(successResultFailedValidation.valueOrUndefined()).toBe(undefined)
    })

    it('should be mappable if a Some', () => {
      const option = Option.from(0)

      const newOption = option.map((value) => value + 10)

      expect(newOption.isSome()).toBe(true)
      expect(newOption.valueOr(100)).toBe(10)
    })

    it('should not be mappable if a None', () => {
      const option = Option.none()

      const newOption = option.map((value) => value + 10)

      expect(newOption.isNone()).toBe(true)
      expect(newOption.valueOr(100)).toBe(100)
    })

    it('should be recoverable if a None', () => {
      const option = Option.none<number>()

      const newOption = option.recover(() => 10)

      expect(newOption.isSome()).toBe(true)
      expect(newOption.valueOr(100)).toBe(10)
    })

    it('should not be recoverable if a Some', () => {
      const option = Option.some(0)

      const newOption = option.recover(() => 10)

      expect(newOption.isSome()).toBe(true)
      expect(newOption.valueOr(100)).toBe(0)
    })

    it('should be reduceable if a Some', () => {
      const option = Option.some(10)

      const reducedValue = option.reduce((context, value) => !!(context && value), 100)

      expect(reducedValue).toBe(true)
    })

    it('should be reduceable if a None', () => {
      const option = Option.none<number>()

      const reducedValue = option.reduce((context, value) => !!(context && value), undefined)

      expect(reducedValue).toBe(false)
    })

    it('should be errorable when None', () => {
      const option = Option.none<number>()

      const errorableFunction = () => option.valueOrError(() => {
        throw new Error('Some error!')
      })

      const errorableFunction2 = () => option.orError(() => {
        throw new Error('Some error!')
      })

      expect(errorableFunction).toThrowError()
      expect(errorableFunction2).toThrowError()
    })

    it('should not be errorable when Some', () => {
      const option = Option.some(0)

      const value = option.valueOrError(() => {
        throw new Error('Some error!')
      })

      const sameOption = option.orError(() => {
        throw new Error('Some error!')
      })

      expect(value).toBe(0)
      expect(sameOption.isSome()).toBe(true)
      expect(sameOption).toEqual(option)
    })

    it('should allow creation from throwable functions', () => {
      const throwableFunction = (shouldError: boolean): number | never => {
        if (shouldError) {
          throw new Error('Some error!')
        }

        return 0
      }
      const noneOption = Option.fromError(() => throwableFunction(true))
      const someOption = Option.fromError(() => throwableFunction(false))

      expect(noneOption.isNone()).toBe(true)
      expect(noneOption.valueOr(20)).toBe(20)
      expect(someOption.isSome()).toBe(true)
      expect(someOption.valueOr(20)).toBe(0)
    })

    it('should be debuggable when `debug` should run', () => {
      const callback = vi.fn()
      const noneOption = Option.none()
      const someOption = Option.some(0)

      noneOption.debug(true, callback)
      noneOption.debug(() => true, callback)
      someOption.debug(true, callback)
      someOption.debug(() => true, callback)

      expect(callback).toHaveBeenCalledTimes(4)
    })

    it('should not be debuggable when `debug` should not run', () => {
      const callback = vi.fn()
      const noneOption = Option.none()
      const someOption = Option.some(0)

      noneOption.debug(false, callback)
      noneOption.debug(() => false, callback)
      someOption.debug(false, callback)
      someOption.debug(() => false, callback)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should be able to run an effect', () => {
      const noneCallback = vi.fn()
      const someCallback = vi.fn()
      const noneOption = Option.none()
      const someOption = Option.some(0)

      noneOption.runEffect(noneCallback)
      someOption.runEffect(someCallback)

      expect(noneCallback).toHaveBeenCalledOnce()
      expect(noneCallback).toHaveBeenCalledWith(noneOption)
      expect(someCallback).toHaveBeenCalledOnce()
      expect(someCallback).toHaveBeenCalledWith(someOption)
    })

    it('should be able to run an effect only when a Some', () => {
      const callback = vi.fn()
      const option = Option.some(0)

      option.runEffectWhenSome(callback)

      expect(callback).toHaveBeenCalledOnce()
      expect(callback).toHaveBeenCalledWith(0)
    })

    it('should be able to run an effect only when a None', () => {
      const callback = vi.fn()
      const someResult = Option.none()

      someResult.runEffectWhenNone(callback)

      expect(callback).toHaveBeenCalledOnce()
    })

    it('should be able to not run an effect when a None', () => {
      const callback = vi.fn()
      const someResult = Option.none()

      someResult.runEffectWhenSome(callback)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should be able to not run an effect when a Some', () => {
      const callback = vi.fn()
      const someResult = Option.some(0)

      someResult.runEffectWhenNone(callback)

      expect(callback).not.toHaveBeenCalled()
    })
  })
}
