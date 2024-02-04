import type { Failure } from './failure'
import type { Success } from './success'

export { Failure, failure } from './failure'
export { Success, success } from './success'

export type Result<S, F> = Success<S> | Failure<F>
