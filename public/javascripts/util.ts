import { ThunkAction } from "redux-thunk";
import { ApplicationState } from "./store";

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

/**
 * Type alias which wraps and simplifies ThunkAction.
 *
 * @param R Return value of async action
 * @param A Actions used within action creator
 */
export type AsyncAction<R, A extends Action> = ThunkAction<R, ApplicationState, void, A>;

export function postFile(endpoint: string, file: File, onProgress: (e: ProgressEvent) => void, field = "file") {
  const formData = new FormData();
  formData.append(field, file);

  const xhr = new XMLHttpRequest();
  xhr.upload.onprogress = onProgress;

  const promise = new Promise((resolve, reject) => {
    xhr.upload.onloadend = () => {
      resolve();
    };

    xhr.upload.onerror = (err) => {
      reject(err);
    };
  });

  xhr.open("POST", endpoint);
  xhr.send(formData);

  return promise;
}
