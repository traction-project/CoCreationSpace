import { Request, Response, NextFunction } from "express";
import * as aws from "aws-sdk";
import * as jwt from "express-jwt";

export function Range(start: number, end: number) {
  if (start === end) {
    return [];
  }

  return new Array(end - start).fill(null).map((_, i) => {
    return start + i;
  });
}

/**
 * Tries to extract the values of the keys given as parameters from the
 * environment and throws an excaption if one of them cannot be found.
 *
 * @param keys Names of the keys that shall be extracted from the environment
 * @returns The values of the extracted keys as an array of strings
 */
export function getFromEnvironment(...keys: Array<string>): Array<string> {
  return keys.reduce<Array<string>>((values, k) => {
    const value = process.env[k];

    // Throw exception if value is not present in environment
    if (value === undefined) {
      throw new Error(`Environment has no key ${k}`);
    }

    return values.concat(value);
  }, []);
}

/**
 * Returns the extension of a given filename with a leading dot. If the given
 * filename has no extension, an empty string is returned.
 *
 * @param filename Filename to get extension from
 * @returns The file extension or an empty string is the filename has no extension
 */
export function getExtension(filename: string): string {
  const parts = filename.split(".");

  if (parts.length == 1) {
    return "";
  }

  return "." + parts.slice(1).join(".");
}

/**
 * Starts a new video transcoding job in the given transcoding pipeline using
 * the given path as input. If the given input has no audio track, the third
 * parameter should be set to false, otherwise the transcoding job will fail.
 * Returns a promise which resolves to the job ID of the created transcoding
 * job or rejects with an error otherwise.
 *
 * The given input file is encoded into three output video streams with the
 * bitrates 4800k, 2400k and 1200k and one audio track (unless `hasAudio` is
 * set to false). Thumbnails will be generated as PNG files from the 4800k
 * video stream, with one thumbnails saved every 5 minutes.
 *
 * @param pipeline ID of the transcoding pipeline to use
 * @param input Path to input file
 * @param hasAudio Whether the file has an audio track, defaults to true
 * @returns A promise which resolves to the job ID if successful, rejects with an error otherwise
 */
export function encodeDash(pipeline: string, input: string, hasAudio = true): Promise<string | undefined> {
  // Get filename without extension
  const inputBasename = input.split(".")[0];

  // Transcoder configuration, outputs are placed under the path transcoded/,
  // with separate directories for each bitrate. Audio tracks and thumbnails
  // are also placed in separate directories. The manifest is placed directly
  // into the transcoded/ folder
  const params = {
    PipelineId: pipeline,
    Input: {
      Key: input,
    },
    OutputKeyPrefix: "transcoded/",
    Outputs: [
      {
        Key: `dash-4m/${inputBasename}`,
        PresetId: "1351620000001-500020",
        SegmentDuration: "10",
        ThumbnailPattern: `thumbnails/${inputBasename}_{count}`
      }, {
        Key: `dash-2m/${inputBasename}`,
        PresetId: "1351620000001-500030",
        SegmentDuration: "10"
      }, {
        Key: `dash-1m/${inputBasename}`,
        PresetId: "1351620000001-500040",
        SegmentDuration: "10"
      }, {
        Key: `dash-audio/${inputBasename}`,
        PresetId: "1351620000001-500060",
        SegmentDuration: "10"
      }
    ],
    Playlists: [
      {
        Format: "MPEG-DASH",
        Name: `${inputBasename}`,
        OutputKeys: [
          `dash-4m/${inputBasename}`,
          `dash-2m/${inputBasename}`,
          `dash-1m/${inputBasename}`,
          `dash-audio/${inputBasename}`,
        ],
      },
    ]
  };

  // Remove config for audio track from transcoding config if hasAudio is false
  if (!hasAudio) {
    params.Outputs = params.Outputs.slice(0, -1);
    params.Playlists[0].OutputKeys = params.Playlists[0].OutputKeys.slice(0, -1);
  }

  // Create and submit transcoding job
  return new Promise((resolve, reject) => {
    const transcoder = new aws.ElasticTranscoder();

    transcoder.createJob(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Job?.Id);
      }
    });
  });
}

/**
 * Translates a given text to the given target language. By default, the
 * language of the input text is determined automatically, but the language
 * of the input text can be set manually, by passing in a language code as
 * third parameter.
 *
 * @param input Text to translate
 * @param targetLanguage Code of the language to translate into
 * @param sourceLanguage Language of the input string, defaults to 'auto'
 * @returns A promise which resolves to the translated text or an error otherwise
 */
export function translateText(input: string, targetLanguage: string, sourceLanguage = "auto"): Promise<string> {
  const params: aws.Translate.TranslateTextRequest = {
    SourceLanguageCode: sourceLanguage,
    TargetLanguageCode: targetLanguage,
    Text: input
  };

  return new Promise((resolve, reject) => {
    const translate = new aws.Translate();

    translate.translateText(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.TranslatedText);
      }
    });
  });
}

/**
 * Middleware function which makes routes which it is applied to require a
 * means of authentication. This authentication needs to be supplied as a JSON
 * Web Token stored in the `Authorization` HTTP header.
 *
 * @returns a JWT request handler which can be used as middleware function
 */
export function tokenRequired(): jwt.RequestHandler {
  const [ SESSION_SECRET ] = getFromEnvironment("SESSION_SECRET");

  return jwt({
    secret: SESSION_SECRET,
  });
}

/**
 * Middleware function which makes routes which it is applied to require a
 * an active session, achieved through a session cookie.
 *
 * @returns a JWT request handler which can be used as middleware function
 */
export function authRequired(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next();
  } else {
    res.status(401);
    res.send({
      status: "ERR",
      message: "Authorisation required"
    });
  }
}
