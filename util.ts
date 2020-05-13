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
    s3.upload({
      Bucket: bucket, Key: keyname, Body: file
    }, {
      partSize: 5 * 1024 * 1024, queueSize: 10
    }, (err, data) => {
      if (err) {
        console.error("ERROR:", err);
        reject(err);
      } else {
        console.log(data);
        resolve();
      }
    });
  });
}

interface TranscribePronunciation {
  type: "pronunciation";
  start_time: string;
  end_time: string;
  alternatives: Array<{
    confidence: string;
    content: string;
  }>;
}

interface TranscribePunctuation {
  type: "punctuation";
  alternatives: Array<{
    content: string;
  }>;
}

type TranscribeItem = TranscribePronunciation | TranscribePunctuation;

export interface TranscribeOutput {
  jobName: string;
  accountId: string;
  results: {
    transcripts: Array<{ transcript: string }>,
    items: Array<TranscribeItem>
  };
}

/**
 * Converts output from AWS Transcribe to WebVTT.
 *
 * @param transcript Output from AWS Transcribe to be converted to WebVTT
 * @returns The resulting WebVTT cues as a string
 */
export function transcribeOutputToVTT(transcript: TranscribeOutput): string {
  const { results: { items }} = transcript;

  const sentences = items.reduce<Array<TranscribeItem[]>>((result, item) => {
    result[result.length -1].push(item);

    if (item.type === "punctuation") {
      const punctuation = item.alternatives[0].content;

      if ([".", "!", "?"].indexOf(punctuation) >= 0) {
        result.push([]);
      }
    }

    return result;
  }, [[]]);

  const cues = sentences.reduce((result, sentence) => {
    if (sentence.length === 0) {
      return result + "";
    }

    const pronunciations = sentence.filter((cue) => cue.type === "pronunciation") as Array<TranscribePronunciation>;

    const cue_start = pronunciations[0].start_time;
    const cue_end = pronunciations[pronunciations.length - 1].end_time;

    const cue = joinSentence(sentence);

    return result + (
      `${cue_start} --> ${cue_end}` + "\n" +
      `${cue}\n\n`
    );
  }, "");

  return `VTT\n\n${cues}`.trim();
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
    if (item.type === "pronunciation") {
      return result + " " + item.alternatives[0].content;
    } else {
      return result + item.alternatives[0].content;
    }
  }, "").trim();
}
