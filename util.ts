import * as aws from "aws-sdk";

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
 * Uploads a file to S3 and assigns it the given name. The name is an S3 key
 * path and can include a prefix. The third parameter is the name of the target
 * bucket. The function returns a void promise which resolves once the upload
 * is complete or rejects with an error otherwise.
 *
 * @param keyname Name that the file should be stored under in the S3 bucket
 * @param file Contents of the file to be uploaded
 * @param bucket Name of the bucket to store the file in
 * @returns A promise which resolves upon completion
 */
export function uploadToS3(keyname: string, file: aws.S3.Body, bucket: string): Promise<void> {
  const s3 = new aws.S3();

  return new Promise((resolve, reject) => {
    // Upload file to given bucket under given key
    s3.upload({
      Bucket: bucket, Key: keyname, Body: file
    }, {
      // Upload in chunks of 5MB, 10 chunks in parallel
      partSize: 5 * 1024 * 1024, queueSize: 10
    }, (err) => {
      // Reject promise if there was an error, otherwise resolve
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Type for words found in the output of AWS Transcribe.
 */
interface TranscribePronunciation {
  type: "pronunciation";
  start_time: string;
  end_time: string;
  alternatives: Array<{
    confidence: string;
    content: string;
  }>;
}

/**
 * Type for punctuation marks found in the output of AWS Transcribe.
 */
interface TranscribePunctuation {
  type: "punctuation";
  alternatives: Array<{
    content: string;
  }>;
}

/**
 * Discriminated union, which unifies TranscribePunctuation and
 * TranscribePronunciation and discriminated on the property 'type'.
 */
type TranscribeItem = TranscribePronunciation | TranscribePunctuation;

/**
 * Type for the output generated by an AWS Transcribe job.
 */
export interface TranscribeOutput {
  jobName: string;
  accountId: string;
  results: {
    transcripts: Array<{ transcript: string }>,
    items: Array<TranscribeItem>
  };
}

/**
 * Converts output from AWS Transcribe to WebVTT. This function takes the
 * transcript generated by an AWS Transcribe job and transforms it into a
 * WebVTT-compatible output that is returned as a string. Each cue in the
 * output corresponds to a sentence in the input (i.e. a sequence of words
 * delimited by end marks such as full stop, question mark or exclamation
 * mark). If a cue is longer than the maximum allowed cue length it is split
 * into two separate cues, each containing half of the original cue.
 *
 * @param transcript Output from AWS Transcribe to be converted to WebVTT
 * @param maxCueLength Maximum number of words in a single cue before splitting it. Defaults to 20
 * @returns The resulting WebVTT cues as a string
 */
export function transcribeOutputToVTT(transcript: TranscribeOutput, maxCueLength = 20): string {
  const { results: { items }} = transcript;

  // Group sentences
  const sentences = items.reduce<Array<TranscribeItem[]>>((result, item) => {
    result[result.length -1].push(item);

    // If current item is a sentence end mark, push a new empty array to result
    // for starting a new sentence
    if (item.type === "punctuation") {
      const punctuation = item.alternatives[0].content;

      if ([".", "!", "?"].indexOf(punctuation) >= 0) {
        result.push([]);
      }
    }

    return result;
  }, [[]]).reduce<Array<TranscribeItem[]>>((result, sentence) => {
    // Count number of words in current sentence
    const numPronunciations = sentence.filter((cue) => cue.type === "pronunciation").length;

    // Split sentece into two if it is longer than the allowed maximum
    if (numPronunciations > maxCueLength) {
      const halfLength = Math.floor(sentence.length / 2);

      // Append the split sentence separately to result
      return result.concat(
        [sentence.slice(0, halfLength)],
        [sentence.slice(halfLength)]
      );
    } else {
      return result.concat([sentence]);
    }
  }, []);

  const cues = sentences.reduce((result, sentence) => {
    // Return result unchanged if sentence is empty
    if (sentence.length === 0) {
      return result;
    }

    // Only get words from sentence
    const pronunciations = sentence.filter(isTranscribePronunciation);

    // Retrieve first and last timestamps from words in current sentence
    const cue_start = parseFloat(pronunciations[0].start_time);
    const cue_end = parseFloat(pronunciations[pronunciations.length - 1].end_time);

    // Join sentence together
    const cue = joinSentence(sentence);

    // Generate cue with valid timestamps and cue text
    return result + (
      `${convertTimestamp(cue_start)} --> ${convertTimestamp(cue_end)}` + "\n" +
      `${cue}\n\n`
    );
  }, "");

  // Return cues together with header and truncate space and newlines
  return `WEBVTT\n\n${cues}`.trim();
}

/**
 * Type guard for TranscribeItem objects which returns whether the passed
 * object is of subtype TranscribePronunciation. This is handy when filtering
 * an array of objects of type TranscribeItem and avoids unnecessary type
 * casting.
 *
 * @param item An object of type TranscribeItem
 */
function isTranscribePronunciation(item: TranscribeItem): item is TranscribePronunciation {
  return item.type === "pronunciation";
}

/**
 * Converts a second-based timestamp into a timestamp that is valid for use in
 * WebVTT. WebVTT timestamps must have the format MM:SS.XXX, where M stands for
 * minutes, S stands for seconds and X stands for milliseconds.
 *
 * @param timestamp Timestamp in seconds
 * @returns Timestamp in valid WebVTT format
 */
function convertTimestamp(timestamp: number): string {
  const minutes = Math.floor(timestamp / 60);
  const seconds = Math.floor(timestamp) - minutes * 60;
  const milliseconds = Math.floor((timestamp - Math.floor(timestamp)) * 100);

  // Return valid WebVTT timestamp
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padEnd(3, "0")}`;
}

/**
 * Joins an array of items returned by AWS Transcribe into a sentence, leaving
 * a space between words, but joining punctuation marks directly.
 *
 * @param items Items to join into a sentence
 * @returns The items joined into a single string
 */
function joinSentence(items: Array<TranscribeItem>): string {
  return items.reduce((result, item) => {
    // If current item is a word, append it to result with a space, otherwise
    // append it directly
    if (item.type === "pronunciation") {
      return result + " " + item.alternatives[0].content;
    } else {
      return result + item.alternatives[0].content;
    }
  }, "").trim();
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
