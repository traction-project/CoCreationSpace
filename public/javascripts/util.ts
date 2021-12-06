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
export interface ResponseUploadType {
  status: string;
  id: string;
  type: string;
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

export interface EmojiReaction {
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
export const availableLanguages: { [key: string]: string } = {
  "af": "Afrikaans",
  "am": "አማርኛ",
  "ar": "العربية",
  "az": "Azərbaycanca",
  "bg": "Български",
  "bn": "বাংলা",
  "bs": "Bosanski",
  "cs": "Čeština",
  "da": "Dansk",
  "de": "Deutsch",
  "el": "Ελληνικά",
  "en": "English",
  "es": "Español",
  "es-MX": "Español (México)",
  "et": "Eesti",
  "fa": "فارسی",
  "fi": "Suomi",
  "fr": "Français",
  "fr-CA": "Français (Canada)",
  "ha": "Hausa",
  "he": "עברית",
  "hi": "हिन्दी",
  "hr": "Hrvatski",
  "hu": "Magyar",
  "id": "Bahasa Indonesia",
  "it": "Italiano",
  "ja": "日本語",
  "ka": "ქართული",
  "ko": "한국어",
  "lv": "Latviešu",
  "ms": "Bahasa Melayu",
  "nl": "Nederlands",
  "no": "Norsk",
  "pl": "Polski",
  "ps": "پښتو",
  "pt": "Português",
  "ro": "Română",
  "ru": "Русский",
  "sk": "Slovenčina",
  "sl": "Slovenščina",
  "so": "Soomaaliga",
  "sq": "Shqip",
  "sr": "Српски / srpski",
  "sv": "Svenska",
  "sw": "Kiswahili",
  "ta": "தமிழ்",
  "th": "ไทย",
  "tl": "Tagalog",
  "tr": "Türkçe",
  "uk": "Українська",
  "ur": "اردو",
  "vi": "Tiếng Việt",
  "zh": "中文",
};

/**
 * Activates the subtitle track for the given language in the given HTML video
 * element. If no such track if found, the function returns false.
 *
 * @param player A HTML video element
 * @param languageCode The language code of the track to activate
 * @returns True if the track was activated, false otherwise
 */
export function activateSubtitleTrack(player: HTMLVideoElement, languageCode: string): boolean {
  const tracks = player.textTracks;
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

/**
 * Deactivates all subtitle tracks for the given video element.
 *
 * @param player A HTML video element
 */
export function disableSubtitles(player: HTMLVideoElement) {
  const tracks = player.textTracks;

  for (let i=0; i<tracks.length; i++) {
    tracks[i].mode = "hidden";
  }
}

/**
 * Activates first subtitle track for the given video element, if
 * available.
 *
 * @param player A HTML video element
 */
export function enableSubtitles(player: HTMLVideoElement) {
  const tracks = player.textTracks;

  if (tracks.length > 0) {
    tracks[0].mode = "showing";
  }
}

/**
 * Checks if the given player has a subtitle track identified by the given
 * language code.
 *
 * @param player A HTML video element
 * @param languageCode The language code of the track to search
 * @returns True if the player has a track with the given code, false otherwise
 */
export function hasSubtitleTrack(player: HTMLVideoElement, languageCode: string): boolean {
  const tracks = player.textTracks;

  for (let i=0; i<tracks.length; i++) {
    if (tracks[i].language == languageCode) {
      return true;
    }
  }

  return false;
}

/**
 * Verify login status with server. Returns true if the user is logged in and
 * false otherwise or if an error occurs.
 *
 * @returns True if user is logged in, false otherwise or in case of error
 */
export async function verifyLoginStatus(): Promise<boolean> {
  try {
    const res = await fetch("/loginstatus");
    const { loggedIn } = await res.json();

    return loggedIn;
  } catch {
    return false;
  }
}

/**
 * Checks whether the client is a mobile device using the user agent string.
 * This is achieved by matching the user agent string against a regex which
 * matches the names of the most common mobile operating systems/browsers.
 * Note that while this will work in the most common cases, it is not
 * completely without fail (e.g. UA-spoofing or obscure devices).
 *
 * @returns true if the client is a mobile device, false otherwise
 */
export function isMobile() {
  const uaRegex = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i;

  if(uaRegex.test(navigator.userAgent)){
    return true;
  }

  return false;
}

/**
 * Returns whether the user's browser supports the MediaRecorder API.
 * This is done by checking whether the `MediaRecorder` object is present or if
 * an exception occurs trying to access it.
 *
 * @returns true if MediaRecorder is supported, false otherwise
 */
export function isMedisRecorderSupported() {
  try {
    return MediaRecorder != undefined;
  } catch {
    return false;
  }
}

/**
 * Converts a FileList object into an array of files. Returns an empty array if
 * the given file list is undefined or null.
 *
 * @param fileList FileList object
 * @returns Files in FileList object as an array
 */
export function getFilesFromList(fileList?: FileList | null): Array<File> {
  if (!fileList) {
    return [];
  }

  const files: Array<File> = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList.item(i);

    if (file != null) {
      files.push(file);
    }
  }

  return files;
}

/**
 * Checks whether the client supports native HLS streaming. This function will
 * return false if the player definitely does not support it. If the function
 * returns true, it is merely an indication that it might be possible. Whether
 * it is actually possible cannot be known until playback is attempted.
 *
 * @returns False if the client does not support it, true if it might
 */
export function supportsNativeHLS(): boolean {
  const videoElement = document.createElement("video");

  if (videoElement.canPlayType("application/vnd.apple.mpegurl") == "") {
    return false;
  }

  return true;
}

/**
 * Checks whether the client supports DASH. This is done by checking whether
 * the `window` object has a property `MediaSource`.
 *
 * @returns True if DASH is supported, false otherwise
 */
export function supportsDash(): boolean {
  if (window.MediaSource) {
    return true;
  }

  return false;
}

/**
 * Parses a query string into a hash map.
 *
 * @param queryString Query string to parse
 * @returns A map of key-value pairs parsed from the query string
 */
export function parseQueryString(queryString: string): Map<string, string> {
  const preparedQueryString = queryString.replace("?", "");

  if (preparedQueryString.length == 0) {
    return new Map();
  }

  return preparedQueryString.split("&").map((pair) => {
    return pair.split("=");
  }).reduce((map, [key, val]) => {
    return map.set(decodeURIComponent(key), decodeURIComponent(val));
  }, new Map<string, string>());
}

/**
 * Converts a map object to a regular JS object.
 *
 * @param map The map to convert
 * @return And object that contains all keys and values in the original map
 */
export function fromEntries<T>(map: Map<string, T>): { [key: string]: T } {
  const obj: { [key: string]: T } = {};

  map.forEach((v, k) => {
    obj[k] = v;
  });

  return obj;
}

/**
 * Parses a string which may contain a single or multiple tags. The function
 * splits the string using comma as well as space, trims the resulting strings,
 * lowercases them and removes the hash character if present.
 *
 * @param tag Tag or list of tags as a single string
 * @return A list of parsed single tags
 */
export function parseTags(tag: string): Array<string> {
  // Split tags using comma
  return tag.split(",").reduce<Array<string>>((acc, t) => {
    // Split each tag using space
    return acc.concat(t.split(" "));
  }, []).map((t) => {
    // Trim tags, lowercase them and remove hash character
    return t.trim().toLowerCase().replace("#", "");
  }).filter((t) => {
    return t.length > 0;
  });
}

/**
 * Returns a list containing all integers between the given start point and end
 * point. If the values for start and end are equal, an empty list is returned.
 * If the end point is less than the start point, a descending list is returned,
 * otherwise an ascending list is returned.
 *
 * @param start Start point of the range (inclusive)
 * @param end End point of the range (exclusive)
 * @returns A list with all integers between start and end
 */
export function Range(start: number, end: number) {
  if (start === end) {
    return [];
  }

  if (end < start) {
    return new Array(start - end).fill(null).map((_, i) => {
      return start - i;
    });
  }

  return new Array(end - start).fill(null).map((_, i) => {
    return start + i;
  });
}

export async function isImageBlurry(image: HTMLImageElement): Promise<boolean> {
  const cv = await import("./vendor/opencv");
  const src = cv.imread(image);

  const dst = new cv.Mat();
  const mean = new cv.Mat();
  const stdDev = new cv.Mat();

  cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
  const laplace = cv.Laplacian(src, dst, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);
  const meanstdev = cv.meanStdDev(src, mean, stdDev);

  console.log(laplace, meanstdev, stdDev.data64F[0], mean.data64F[0]);

  src.delete();
  dst.delete();

  if (stdDev.data64F[0] > 10) {
    return false;
  }

  return true;
}
