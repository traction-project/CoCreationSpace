import * as sinon from "sinon";
import * as aws from "aws-sdk";

import * as transcribeResponses from "./fixtures/transcribe_responses";

import * as util from "../util";
import * as transcribe from "../util/transcribe";
import * as s3 from "../util/s3";

describe("Utility function getFromEnvironment()", () => {
  it("returns an empty array when no arguments are given", () => {
    expect(
      util.getFromEnvironment()
    ).toEqual([]);
  });

  it("should throw an error when requesting something from empty environment", () => {
    expect(() => {
      util.getFromEnvironment("SOME_KEY");
    }).toThrow();
  });

  it("should return the requested key if it's available", () => {
    process.env = {
      "SOME_KEY": "some_value"
    };

    expect(
      util.getFromEnvironment("SOME_KEY")
    ).toEqual([
      "some_value"
    ]);
  });

  it("should only return the requested keys", () => {
    process.env = {
      "SOME_KEY": "some_value",
      "SOME_OTHER_KEY": "some_other_value",
      "BLA": "yaddayadda"
    };

    expect(
      util.getFromEnvironment("SOME_KEY", "BLA")
    ).toEqual([
      "some_value", "yaddayadda"
    ]);
  });

  it("should throw an error if one of the requested keys is not available", () => {
    process.env = {
      "SOME_KEY": "some_value",
      "SOME_OTHER_KEY": "some_other_value",
      "BLA": "yaddayadda"
    };

    expect(() => {
      util.getFromEnvironment("SOME_KEY", "BLA", "NO_SUCH_KEY");
    }).toThrow();
  });
});

describe("Utility function uploadToS3()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should resolve the promise", async () => {
    sinon.stub(aws, "S3").returns({
      upload: (a: any, b: any, callback: () => void) => {
        callback();
      }
    });

    expect(
      await s3.uploadToS3("some/key", "some_body", "some_bucket")
    ).toBeUndefined();
  });

  it("should reject the promise returning an error", async () => {
    sinon.stub(aws, "S3").returns({
      upload: (a: any, b: any, callback: (err: any) => void) => {
        callback(new Error("ERROR"));
      }
    });

    try {
      await s3.uploadToS3("some/key", "some_body", "some_bucket");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("ERROR");
    }
  });
});

describe("Utility function encodeDash()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should resolve the promise with the new job id", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, { Job: { Id: "new_job_id" } });
      }
    });

    expect(
      await util.encodeDash("my_pipeline", "video.mp4")
    ).toEqual("new_job_id");
  });

  it("should resolve the promise with undefined if job property is undefined", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {});
      }
    });

    expect(
      await util.encodeDash("my_pipeline", "video.mp4")
    ).toBeUndefined();
  });

  it("should reject the promise returning an error", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error) => void) => {
        callback(new Error("ERROR"));
      }
    });

    try {
      await util.encodeDash("my_pipeline", "video.mp4");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("ERROR");
    }
  });

  it("should remove audio track from params if hasAudio is false", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        // Use combination of input names as 'job id' for test to work
        const jobId = params.Outputs.map((o: any) => o.Key).join(",");
        callback(null, { Job: { Id: jobId } });
      }
    });

    const result = await util.encodeDash("my_pipeline", "video.mp4", false);

    expect(result).toBeDefined();
    expect(result?.split(",").length).toEqual(3);

    expect(result?.split(",")).toEqual([
      "dash-4m/video",
      "dash-2m/video",
      "dash-1m/video"
    ]);
  });

  it("should include audio track if hasAudio is true", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        // Use combination of input names as 'job id' for test to work
        const jobId = params.Outputs.map((o: any) => o.Key).join(",");
        callback(null, { Job: { Id: jobId } });
      }
    });

    const result = await util.encodeDash("my_pipeline", "video.mp4", true);

    expect(result).toBeDefined();
    expect(result?.split(",").length).toEqual(4);

    expect(result?.split(",")).toEqual([
      "dash-4m/video",
      "dash-2m/video",
      "dash-1m/video",
      "dash-audio/video"
    ]);
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

describe("Utility function getExtension()", () => {
  it("should return the file's extension", () => {
    expect(util.getExtension("video.mp4")).toEqual(".mp4");
  });

  it("should return the all extensions if the filename has multiple extensions", () => {
    expect(util.getExtension("archive.tar.gz")).toEqual(".tar.gz");
  });

  it("should return an empty string is the file has no extension", () => {
    expect(util.getExtension("some_strange_filename")).toEqual("");
  });
});

describe("Utility function translateText()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should resolve with a string", async () => {
    sinon.stub(aws, "Translate").returns({
      translateText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, { TranslatedText: "This is the translated text" });
      }
    });

    expect(
      await util.translateText("This is the input text", "de")
    ).toEqual(
      "This is the translated text"
    );
  });

  it("should reject with an error", async () => {
    sinon.stub(aws, "Translate").returns({
      translateText: (params: any, callback: (err: Error) => void) => {
        callback(new Error("ERROR"));
      }
    });

    try {
      await util.translateText("This is the input text", "de");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("ERROR");
    }
  });

  it("should change the source language if it is set explicitly", async () => {
    sinon.stub(aws, "Translate").returns({
      translateText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TranslatedText: `The text is translated from ${params.SourceLanguageCode}`
        });
      }
    });

    expect(
      await util.translateText("This is the input text", "de", "en")
    ).toEqual(
      "The text is translated from en"
    );
  });
});

describe("Utility function tokenRequired()", () => {
  it("should return a function", () => {
    process.env = {
      SESSION_SECRET: "secret"
    };

    expect(
      util.tokenRequired()
    ).toBeInstanceOf(Function);
  });
});
