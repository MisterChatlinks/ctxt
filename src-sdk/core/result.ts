import { MonitextFailure, MonitextSuccess } from "./types/result";

/**
 * Represents the result of an operation that can either succeed or fail.
 * 
 * This class encapsulates a discriminated union-like structure with a boolean `ok` flag
 * and either a `value` (for success) or an `error` (for failure).
 *
 * @template T The type of the value on success.
 */
export class MonitextResult<T> {
  /**
   * Indicates whether the operation succeeded.
   */
  readonly ok: boolean;

  /**
   * The value returned on success.
   * This is only defined if `ok` is `true`.
   */
  readonly value?: T;

  /**
   * The error returned on failure.
   * This is only defined if `ok` is `false`.
   */
  readonly error?: Error;

  /**
   * Constructs a new MonitextResult instance.
   *
   * @param ok - Whether the result is a success (`true`) or failure (`false`).
   * @param value - The value returned if the result is successful.
   * @param error - The error object if the result is a failure.
   * @private
   */
  private constructor(ok: boolean, value?: T, error?: Error) {
    this.ok = ok;
    this.value = value;
    this.error = error;
  }

  /**
   * Creates a successful result.
   *
   * @param value - The value of the successful result.
   * @returns A `MonitextResult` with `ok: true` and the provided value.
   */
  static ok<T>(value: T): MonitextSuccess<T> {
    return new MonitextResult<T>(true, value) as MonitextSuccess<T>;
  }

  /**
   * Creates a failed result.
   *
   * @param error - The error that caused the failure.
   * @returns A `MonitextResult` with `ok: false` and the provided error.
   */
  static fail<T>(error: Error): MonitextFailure {
    return new MonitextResult<T>(false, undefined, error) as MonitextFailure;
  }
}
