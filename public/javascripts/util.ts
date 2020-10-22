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

/**
 * Type alias from upload file response
 */
export type ResponseUploadType = {
  status: string;
  id: number;
}

export function postFile(endpoint: string, file: File, onProgress: (e: ProgressEvent) => void, field = "file"): Promise<string> {
  const formData = new FormData();
  formData.append(field, file);

  const xhr = new XMLHttpRequest();
  xhr.upload.onprogress = onProgress;

  const promise: Promise<string> = new Promise((resolve, reject) => {
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        resolve(xhr.response);
      }
    };

    xhr.upload.onerror = (err) => {
      reject(err);
    };
  });

  xhr.open("POST", endpoint);
  xhr.send(formData);

  return promise;
}

export type commonType = {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export type EmojiReaction = {
  emoji: string;
  second: number;
}

// Conver seconds to hh:mm:ss format
export const convertHMS = (second: number) => {
  const hours   = Math.floor(second / 3600);
  const minutes = Math.floor((second - (hours * 3600)) / 60);
  const seconds = Math.floor(second - (hours * 3600) - (minutes * 60));

  let time = hours !== 0 ? (hours < 10 ? `0${hours}:` : `${hours}:`) : "";
  time = `${time}${minutes < 10 ? `0${minutes}:` : `${minutes}:`}`;
  time = `${time}${seconds < 10 ? `0${seconds}` : `${seconds}`}`;
  return time;
};