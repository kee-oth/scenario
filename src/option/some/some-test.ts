import { describe, expect, it, vi } from 'vitest'

import type { Option } from '..'
import { none } from '../none'
import { Some, some } from '.'

const getOption = (kind: 'none' | 'some'): Option<number> => {
  return kind === 'none' ? none<number>() : some(0)
}

if (import.meta.vitest) {
  describe('the Some class', () => {
    it('should identify as a Some', () => {
      // Test
      const anOption = getOption('some')

      // Assert
      expect(anOption instanceof Some).toBe(true)
      expect(anOption.isSome()).toEqual(anOption instanceof Some)
      expect(anOption.isSome()).toEqual(true)
    })

    it('should not identify as a None', () => {
      // Test
      const anOption = getOption('some')

      // Assert
      expect(anOption.isNone()).toEqual(false)
    })

    it('should be mappable', () => {
      // Setup
      const anOption = getOption('some')

      // Test
      const newOption = anOption.map((currentValue) => currentValue + 5)

      // Assert
      expect(newOption.isSome()).toEqual(true)
      expect(newOption.value).toEqual(5)
    })

    it('should be async mappable', async () => {
      // Setup
      const anOption = getOption('some')

      // Test
      const newOption = await anOption.mapAsync((currentValue) => Promise.resolve(some(currentValue + 5)))

      // Assert
      expect(newOption.isSome()).toEqual(true)
      expect(newOption.value).toEqual(5)
    })

    it('should not be recoverable', async () => {
      // Setup
      const anOption = getOption('some')

      // Test
      const newOption = anOption.recover(() => 5)

      // Assert
      expect(newOption.isSome()).toEqual(true)
      expect(newOption.value).not.toEqual(5)
    })

    // it('should be reduceable', async () => {
    //   // Setup
    //   const anOption = getOption('some')

    //   // Test
    //   const reducedValue = anOption.reduce((currentValue, context) => currentValue + context, 10)

    //   // Assert
    //   expect(reducedValue).toEqual(10)
    // })
  })
}
