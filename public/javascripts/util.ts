import { ThunkAction } from "redux-thunk";
import { VideoJsPlayer } from "video.js";
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
  id: string;
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

export interface CommonType {
  id: string;
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

/**
 * Available languages for AWS Translate and their corresponding language codes
 */
export const availableLanguages = {
  "af": "Afrikaans",
  "sq": "Albanian",
  "am": "Amharic",
  "ar": "Arabic",
  "az": "Azerbaijani",
  "bn": "Bengali",
  "bs": "Bosnian",
  "bg": "Bulgarian",
  "zh": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  "hr": "Croatian",
  "cs": "Czech",
  "da": "Danish",
  "fa-AF": "Dari",
  "nl": "Dutch",
  "en": "English",
  "et": "Estonian",
  "fi": "Finnish",
  "fr": "French",
  "fr-CA": "French (Canada)",
  "ka": "Georgian",
  "de": "German",
  "el": "Greek",
  "ha": "Hausa",
  "he": "Hebrew",
  "hi": "Hindi",
  "hu": "Hungarian",
  "id": "Indonesian",
  "it": "Italian",
  "ja": "Japanese",
  "ko": "Korean",
  "lv": "Latvian",
  "ms": "Malay",
  "no": "Norwegian",
  "fa": "Persian",
  "ps": "Pashto",
  "pl": "Polish",
  "pt": "Portuguese",
  "ro": "Romanian",
  "ru": "Russian",
  "sr": "Serbian",
  "sk": "Slovak",
  "sl": "Slovenian",
  "so": "Somali",
  "es": "Spanish",
  "es-MX": "Spanish (Mexico)",
  "sw": "Swahili",
  "sv": "Swedish",
  "tl": "Tagalog",
  "ta": "Tamil",
  "th": "Thai",
  "tr": "Turkish",
  "uk": "Ukrainian",
  "ur": "Urdu",
  "vi": "Vietnamese"
};

/**
 * Activates the subtitle track for the given langauge in the given video.js
 * player instance. If no such track if found, the function returns false.
 *
 * @param player A video.js player instance
 * @param languageCode The language code of the track to activate
 * @returns True if the track was activated, false otherwise
 */
export function activateSubtitleTrack(player: VideoJsPlayer, languageCode: string): boolean {
  const tracks = player.textTracks();
  let found = false;

  for (let i=0; i<tracks.length; i++) {
    if (tracks[i].language == languageCode) {
      tracks[i].mode = "showing";
      found = true;
    } else {
      tracks[i].mode = "hidden";
    }
  }

  return found;
}
