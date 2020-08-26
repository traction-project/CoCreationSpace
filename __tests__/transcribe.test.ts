import * as sinon from "sinon";
import * as aws from "aws-sdk";
import * as nodeFetch from "node-fetch";

import * as transcribe from "../util/transcribe";
import * as transcribeResponses from "./fixtures/transcribe_responses";

describe("Utility function transcribeMediaFile()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should resolve the promise", async () => {
    sinon.stub(aws, "TranscribeService").returns({
      startTranscriptionJob: (params: any, callback: (err: Error | null) => void) => {
        callback(null);
      }
    });

    expect(
      await transcribe.transcribeMediaFile("en_us", "some_path/some_file.mp4", "some_bucket")
    ).toBeUndefined();
  });

  it("should reject with an error message", async () => {
    sinon.stub(aws, "TranscribeService").returns({
      startTranscriptionJob: (params: any, callback: (err: Error | null) => void) => {
        callback(new Error("ERROR"));
      }
    });

    try {
      await transcribe.transcribeMediaFile("en_us", "some_path/some_file.mp4", "some_bucket");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("ERROR");
    }
  });
});

describe("Utility function fetchTranscript()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should reject with an error", async () => {
    sinon.stub(aws, "TranscribeService").returns({
      getTranscriptionJob: (params: any, callback: (err: Error | null) => void) => {
        callback(new Error("some error"));
      }
    });

    try {
      await transcribe.fetchTranscript("some_job_name");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("some error");
    }
  });

  it("should reject if the transription job could not be retrieved", async () => {
    sinon.stub(aws, "TranscribeService").returns({
      getTranscriptionJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
        });
      }
    });

    try {
      await transcribe.fetchTranscript("some_job_name");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("Transcription job not available");
    }
  });

  it("should reject if the transcription job has a status not equal to COMPLETED", async () => {
    sinon.stub(aws, "TranscribeService").returns({
      getTranscriptionJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TranscriptionJob: {
            TranscriptionJobStatus: "QUEUED"
          }
        });
      }
    });

    try {
      await transcribe.fetchTranscript("some_job_name");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("Invalid job status: QUEUED");
    }
  });

  it("should reject if the response does not contain a transcript key", async () => {
    sinon.stub(aws, "TranscribeService").returns({
      getTranscriptionJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TranscriptionJob: {
            TranscriptionJobStatus: "COMPLETED"
          }
        });
      }
    });

    try {
      await transcribe.fetchTranscript("some_job_name");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("Could not retrieve transcript URI from job");
    }
  });

  it("should reject if the transcript URI could not be retrieved", async () => {
    sinon.stub(aws, "TranscribeService").returns({
      getTranscriptionJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TranscriptionJob: {
            TranscriptionJobStatus: "COMPLETED",
            Transcript: {}
          }
        });
      }
    });

    try {
      await transcribe.fetchTranscript("some_job_name");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("Could not retrieve transcript URI from job");
    }
  });

  it("should resolve with the transcript and language code", async () => {
    sinon.stub(aws, "TranscribeService").returns({
      getTranscriptionJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TranscriptionJob: {
            TranscriptionJobStatus: "COMPLETED",
            LanguageCode: "en_US",
            Transcript: {
              TranscriptFileUri: "http://some_uri.com"
            }
          }
        });
      }
    });

    sinon.stub(nodeFetch, "default").returns(Promise.resolve(new nodeFetch.Response(JSON.stringify({
      transcript: "This is the transcript"
    }))));

    const { language, transcript } = await transcribe.fetchTranscript("some_job_name");

    expect(language).toEqual("en_US");
    expect(transcript).toEqual({ transcript: "This is the transcript" });
  });
});

describe("Utility function generateCues()", () => {
  it("should produce a file with only a header on empty input", () => {
    expect(
      transcribe.generateCues(transcribeResponses.emptyResponse)
    ).toEqual([]);
  });

  it("should produce a file with a single cue with a single sentence in the input", () => {
    expect(transcribe.generateCues(transcribeResponses.singleCue)).toEqual([
      {
        cueStart: 0,
        cueEnd: 0.84,
        cue: "Hello, World!"
      }
    ]);
  });

  it("should produce a file with multiple cues with multiple sentences in the input", () => {
    expect(transcribe.generateCues(transcribeResponses.multipleCues)).toEqual([
      {
        cueStart: 0,
        cueEnd: 0.84,
        cue: "Hello, World!"
      },
      {
        cueStart: 1,
        cueEnd: 1.5,
        cue: "How are you?"
      }
    ]);
  });

  it("should produce a file with multiple cues with multiple sentences in the input and timestamps above a minute", () => {
    expect(transcribe.generateCues(transcribeResponses.multipleCuesOverMinute)).toEqual([
      {
        cueStart: 0,
        cueEnd: 0.84,
        cue: "Hello, World!"
      },
      {
        cueStart: 64,
        cueEnd: 64.5,
        cue: "How are you?"
      }
    ]);
  });

  it("should split a cue into two parts if it is longer than the max cue length", () => {
    expect(transcribe.generateCues(transcribeResponses.splitCues)).toEqual([
      {
        cueStart: 0,
        cueEnd: 1.5,
        cue: "Hello, World How are you?"
      }
    ]);

    expect(transcribe.generateCues(transcribeResponses.splitCues, 4)).toEqual([
      {
        cueStart: 0,
        cueEnd: 0.84,
        cue: "Hello, World"
      },
      {
        cueStart: 1,
        cueEnd: 1.5,
        cue: "How are you?"
      }
    ]);
  });
});

describe("Utility function generateVTT()", () => {
  it("should produce output which only contains the header if there are now cues", () => {
    expect(transcribe.generateVTT([])).toEqual(
      "WEBVTT"
    );
  });

  it("should generate a WebVTT output if there is a single cue in the input", () => {
    const cue = {
      cueStart: 0,
      cueEnd: 25.12,
      cue: "Hello"
    };

    expect(transcribe.generateVTT([cue])).toEqual(
      "WEBVTT\n" +
      "\n" +
      "00:00.000 --> 00:25.120\n" +
      "Hello"
    );
  });

  it("should generate a WebVTT output with all cues in the input", () => {
    const cues = [
      {
        cueStart: 0,
        cueEnd: 25.12,
        cue: "Hello"
      },
      {
        cueStart: 27,
        cueEnd: 30,
        cue: "World!"
      },
      {
        cueStart: 35,
        cueEnd: 66,
        cue: "How are"
      },
      {
        cueStart: 70,
        cueEnd: 82.34,
        cue: "you?"
      }
    ];

    expect(transcribe.generateVTT(cues)).toEqual(
      "WEBVTT\n" +
      "\n" +
      "00:00.000 --> 00:25.120\n" +
      "Hello\n" +
      "\n" +
      "00:27.000 --> 00:30.000\n" +
      "World!\n" +
      "\n" +
      "00:35.000 --> 01:06.000\n" +
      "How are\n" +
      "\n" +
      "01:10.000 --> 01:22.340\n" +
      "you?"
    );
  });
});

describe("Utility function transcribeOutputToVTT()", () => {
  it("should produce a file with only a header on empty input", () => {
    expect(
      transcribe.transcribeOutputToVTT(transcribeResponses.emptyResponse)
    ).toEqual("WEBVTT");
  });

  it("should produce a file with a single cue with a single sentence in the input", () => {
    expect(transcribe.transcribeOutputToVTT(transcribeResponses.singleCue)).toEqual(
      "WEBVTT\n" +
      "\n" +
      "00:00.000 --> 00:00.840\n" +
      "Hello, World!"
    );
  });

  it("should produce a file with multiple cues with multiple sentences in the input", () => {
    expect(transcribe.transcribeOutputToVTT(transcribeResponses.multipleCues)).toEqual(
      "WEBVTT\n" +
      "\n" +
      "00:00.000 --> 00:00.840\n" +
      "Hello, World!\n" +
      "\n" +
      "00:01.000 --> 00:01.500\n" +
      "How are you?"
    );
  });

  it("should produce a file with multiple cues with multiple sentences in the input and timestamps above a minute", () => {
    expect(transcribe.transcribeOutputToVTT(transcribeResponses.multipleCuesOverMinute)).toEqual(
      "WEBVTT\n" +
      "\n" +
      "00:00.000 --> 00:00.840\n" +
      "Hello, World!\n" +
      "\n" +
      "01:04.000 --> 01:04.500\n" +
      "How are you?"
    );
  });

  it("should split a cue into two parts if it is longer than the max cue length", () => {
    expect(transcribe.transcribeOutputToVTT(transcribeResponses.splitCues)).toEqual(
      "WEBVTT\n" +
      "\n" +
      "00:00.000 --> 00:01.500\n" +
      "Hello, World How are you?"
    );

    expect(transcribe.transcribeOutputToVTT(transcribeResponses.splitCues, 4)).toEqual(
      "WEBVTT\n" +
      "\n" +
      "00:00.000 --> 00:00.840\n" +
      "Hello, World\n" +
      "\n" +
      "00:01.000 --> 00:01.500\n" +
      "How are you?"
    );
  });
});

describe("Utility function translateCues()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should reject with an error if the number of translated cues is more than the input", async () => {
    sinon.stub(aws, "Translate").returns({
      translateText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TranslatedText: "Hello<br/>World"
        });
      }
    });

    const cue = {
      cueStart: 0,
      cueEnd: 5,
      cue: "Hello"
    };

    try {
      await transcribe.translateCues([cue], "de");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("Length of translated cues is different from input cues");
    }
  });

  it("should reject with an error if the number of translated cues is less than the input", async () => {
    sinon.stub(aws, "Translate").returns({
      translateText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TranslatedText: "Hello"
        });
      }
    });

    const cues = [
      {
        cueStart: 0,
        cueEnd: 5,
        cue: "Hello"
      },
      {
        cueStart: 6,
        cueEnd: 10,
        cue: "World"
      },
    ];

    try {
      await transcribe.translateCues(cues, "de");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("Length of translated cues is different from input cues");
    }
  });

  it("should resolve with a list of translated cues on success", async () => {
    sinon.stub(aws, "Translate").returns({
      translateText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TranslatedText: "Hallo<br/>Welt"
        });
      }
    });

    const cues = [
      {
        cueStart: 0,
        cueEnd: 5,
        cue: "Hello"
      },
      {
        cueStart: 6,
        cueEnd: 10,
        cue: "World"
      },
    ];

    const translatedCues = await transcribe.translateCues(cues, "de");

    expect(translatedCues.length).toEqual(cues.length);

    expect(translatedCues[0].cueStart).toEqual(cues[0].cueStart);
    expect(translatedCues[1].cueStart).toEqual(cues[1].cueStart);

    expect(translatedCues[0].cueEnd).toEqual(cues[0].cueEnd);
    expect(translatedCues[1].cueEnd).toEqual(cues[1].cueEnd);

    expect(translatedCues[0].cue).toEqual("Hallo");
    expect(translatedCues[1].cue).toEqual("Welt");
  });
});
