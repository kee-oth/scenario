import type { None } from './none'
import type { Some } from './some'

export type Option<T> = Some<T> | None
