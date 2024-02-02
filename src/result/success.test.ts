import { describe, expect, it, vi } from 'vitest'
import { Failure, Result, Success } from './'

describe('the Success class', () => {
  it('should be able to identify itself as a Success', () => {
    // Test
    const newSuccess = Result.success(0)

    // Assert
    expect(newSuccess instanceof Success).toBe(true)
    expect(newSuccess.isSuccess()).toEqual(newSuccess instanceof Success)
  })
  it('should identify as a Success', () => {
    // Test
    const newSuccess = Result.success(0)

    // Assert
    expect(newSuccess.isSuccess()).toEqual(true)
  })
  it('should not identify as a Failure', () => {
    // Test
    const newSuccess = Result.success(0)

    // Assert
    expect(newSuccess.isFailure()).toEqual(false)
  })
})
