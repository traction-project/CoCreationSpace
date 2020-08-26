import * as aws from "aws-sdk";
import fetch from "node-fetch";

import { translateText } from "./index";

/**
 * Type for segments in the speaker labels from AWS Transcribe
 */
interface SpeakerLabelSegment {
  start_time: string;
  end_time: string;
  speaker_label: string;
  items: Array<{
    start_time: string;
    end_time: string;
    speaker_label: string;
  }>;
}

/**
 * Type for speaker labels in the output of AWS Transcribe
 */
interface SpeakerLabels {
  speakers: number;
  segments: Array<SpeakerLabelSegment>;
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
    speaker_labels: SpeakerLabels,
    items: Array<TranscribeItem>
  };
}

/**
 * Starts a new transcription job for the given media file using the given
 * language. Language codes need to be supplied as ISO language codes, e.g.
 * `en-us` or `de-de`. The functions returns a promise which resolves once the
 * job was submitted successfully or rejects with an error otherwise.
 *
 * @param inputLanguage Language code for the language used in the input file
 * @param inputFile URI of the input media file for which the transcript shall be generated
 * @param bucketName Name of the bucket that the input file is located in
 * @returns Promise which resolves upon completion
 */
export function transcribeMediaFile(inputLanguage: string, inputFile: string, bucketName: string): Promise<void> {
  const jobName = inputFile.split(".")[0];
  const s3url = `s3://${bucketName}/${inputFile}`;

  const params = {
    TranscriptionJobName: jobName,
    LanguageCode: inputLanguage,
    Media: {
      MediaFileUri: s3url
    }
  };

  return new Promise((resolve, reject) => {
    const transcribe = new aws.TranscribeService();

    transcribe.startTranscriptionJob(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Tries to retrieve the transcript associated with the given job name. If the
 * transcription job was marked as `COMPLETED` and has a transcription file URI
 * available, the transcript is downloaded and the returned promise is resolved
 * receiving it and its associated language code as values. If the job is not
 * completed yet, resulted in error or the call failed altogether, the promise
 * is rejected.
 *
 * @param jobName Name of the job for which the transcript shall be retrieved
 * @returns A promise resolving to the retrieved transcript alongside a language code
 */
export function fetchTranscript(jobName: string): Promise<{ language: string, transcript: TranscribeOutput }> {
  return new Promise((resolve, reject) => {
    const transcribe = new aws.TranscribeService();

    // Try and fetch transcript
    transcribe.getTranscriptionJob({ TranscriptionJobName: jobName }, async (err, data) => {
      // Reject if there was an error
      if (err) {
        return reject(err);
      }

      if (!data.TranscriptionJob) {
        return reject(new Error("Transcription job not available"));
      }

      // Reject if the transcript status is different from COMPLETED
      if (data.TranscriptionJob.TranscriptionJobStatus != "COMPLETED") {
        return reject(new Error(`Invalid job status: ${data.TranscriptionJob.TranscriptionJobStatus}`));
      }

      // Get language code
      const transcriptLanguage = data.TranscriptionJob.LanguageCode!;
      // Get transcript url
      const transcriptUri = data.TranscriptionJob.Transcript?.TranscriptFileUri!;

      if (!transcriptUri) {
        return reject(new Error("Could not retrieve transcript URI from job"));
      }

      // Download transcript from given url
      fetch(transcriptUri).then((res) => {
        return res.json();
      }).then((transcript) => {
        resolve({
          language: transcriptLanguage,
          transcript
        });
      });
    });
  });
}

/**
 * Data type representing a cue in the WebVTT output
 */
export interface Cue {
  cueStart: number;
  cueEnd: number;
  cue: string;
}

/**
 * Converts output from AWS Transcribe to an array of cues. This function takes
 * the * transcript generated by an AWS Transcribe job and transforms it into a
 * an array of cue objects with cue content, start time and end time (in
 * seconds). Each cue in the output corresponds to a sentence in the input
 * (i.e. a sequence of * words delimited by end marks such as full stop,
 * question mark or exclamation mark). If a cue is longer than the maximum
 * allowed cue length it is split into two separate cues, each containing half
 * of the original cue.
 *
 * @param transcript Output from AWS Transcribe to be converted to WebVTT
 * @param maxCueLength Maximum number of words in a single cue before splitting it. Defaults to 20
 * @returns An array of cues grouped as sentences with start time, end time and content
 */
export function generateCues(transcript: TranscribeOutput, maxCueLength = 20): Array<Cue> {
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

  return sentences.reduce<Array<Cue>>((result, sentence) => {
    // Return result unchanged if sentence is empty
    if (sentence.length === 0) {
      return result;
    }

    // Only get words from sentence
    const pronunciations = sentence.filter(isTranscribePronunciation);

    // Retrieve first and last timestamps from words in current sentence
    const cueStart = parseFloat(pronunciations[0].start_time);
    const cueEnd = parseFloat(pronunciations[pronunciations.length - 1].end_time);

    // Join sentence together
    const cue = joinSentence(sentence);

    return result.concat({
      cueStart, cueEnd, cue
    });
  }, []);
}

/**
 * Converts a list of cue objects into a WebVTT compatible format, which is
 * then returned as a string.
 *
 * @param cues A list of cue objects
 * @returns The resulting WebVTT cues as a string
 */
export function generateVTT(cues: Array<Cue>): string {
  const vtt = cues.reduce((result, cue) => {
    // Generate cue with valid timestamps and cue text
    return result + (
      `${convertTimestamp(cue.cueStart)} --> ${convertTimestamp(cue.cueEnd)}` + "\n" +
      `${cue.cue}\n\n`
    );
  }, "");

  // Return cues together with header and truncate space and newlines
  return `WEBVTT\n\n${vtt}`.trim();
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
  return generateVTT(generateCues(transcript, maxCueLength));
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
 * Translates all cues in a given list of cues into the given target language.
 * The function returns a promise resolving the a list of translated cues or
 * rejects with an error.
 *
 * @param cues List of cues to translate
 * @param target Target language to translate the cues to
 */
export async function translateCues(cues: Array<Cue>, target: string): Promise<Array<Cue>> {
  // Join all cue texts with <br/> in between
  const cueText = cues.map((c) => c.cue).join("<br/>");

  // Translate entire text
  const translatedCueText = await translateText(cueText, target);
  // Split text into cues using <br/>
  const translatedCues = translatedCueText.split("<br/>");

  // Make sure we have the same number of cues as in the input
  if (cues.length != translatedCues.length) {
    throw new Error("Length of translated cues is different from input cues");
  }

  // Return a new list of cues replacing the cue texts with corresponding tranlations
  return cues.map((c, i) => {
    return {
      ...c,
      cue: translatedCues[i]
    };
  });
}
