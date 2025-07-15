/**
 * Represents a successful result.
 *
 * @template T The type of the value returned on success.
 */
export interface MonitextSuccess<T> {
  ok: true;
  value: T;
  error?: never;
}

/**
 * Represents a failed result.
 */
export interface MonitextFailure {
  ok: false;
  value?: never;
  error: Error;
}

/**
 * Discriminated union type representing either a success or failure result.
 *
 * @template T The type of the success value.
 */
export type MonitextResultType<T> = MonitextSuccess<T> | MonitextFailure;
