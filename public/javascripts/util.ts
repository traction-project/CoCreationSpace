/**
 * Basic action without payload and string for name of action.
 */
interface Action {
  type: string;
}

/**
 * Basic action without payload and generic type for name of action.
 *
 * @param T String literal type for name of action
 */
export interface BasicAction<T extends string> extends Action {
  type: T;
}

/**
 * Action which includes a payload.
 *
 * @param T String literal type for name of action
 * @param U Shape of payload
 */
export interface PayloadAction<T extends string, U> extends BasicAction<T> {
  payload: U;
}
