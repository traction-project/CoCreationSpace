import sinon from "sinon";
import aws from "aws-sdk";

import * as transcode from "../util/transcode";

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
      await transcode.encodeDash("my_pipeline", "video.mp4")
    ).toEqual("new_job_id");
  });

  it("should resolve the promise with undefined if job property is undefined", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {});
      }
    });

    expect(
      await transcode.encodeDash("my_pipeline", "video.mp4")
    ).toBeUndefined();
  });

  it("should reject the promise returning an error", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error) => void) => {
        callback(new Error("ERROR"));
      }
    });

    try {
      await transcode.encodeDash("my_pipeline", "video.mp4");
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

    const result = await transcode.encodeDash("my_pipeline", "video.mp4", false);

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

    const result = await transcode.encodeDash("my_pipeline", "video.mp4", true);

    expect(result).toBeDefined();
    expect(result?.split(",").length).toEqual(4);

    expect(result?.split(",")).toEqual([
      "dash-4m/video",
      "dash-2m/video",
      "dash-1m/video",
      "dash-audio/video"
    ]);
  });

  it("should only include specified resolutions in the output", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        // Use combination of input names as 'job id' for test to work
        const jobId = params.Outputs.map((o: any) => o.Key).join(",");
        callback(null, { Job: { Id: jobId } });
      }
    });

    const result = await transcode.encodeDash("my_pipeline", "video.mp4", false, ["720p", "360p"]);

    expect(result).toBeDefined();
    expect(result?.split(",").length).toEqual(2);

    expect(result?.split(",")).toEqual([
      "dash-4m/video",
      "dash-1m/video"
    ]);
  });

  it("should skip invalid resolutions and not include the in the output", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        // Use combination of input names as 'job id' for test to work
        const jobId = params.Outputs.map((o: any) => o.Key).join(",");
        callback(null, { Job: { Id: jobId } });
      }
    });

    const result = await transcode.encodeDash("my_pipeline", "video.mp4", false, ["720p", "360p", "4k", "potato"]);

    expect(result).toBeDefined();
    expect(result?.split(",").length).toEqual(2);

    expect(result?.split(",")).toEqual([
      "dash-4m/video",
      "dash-1m/video"
    ]);
  });
});

describe("Utility function encodeHLS()", () => {
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
      await transcode.encodeHLS("my_pipeline", "video.mp4")
    ).toEqual("new_job_id");
  });

  it("should resolve the promise with undefined if job property is undefined", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {});
      }
    });

    expect(
      await transcode.encodeHLS("my_pipeline", "video.mp4")
    ).toBeUndefined();
  });

  it("should reject the promise returning an error", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error) => void) => {
        callback(new Error("ERROR"));
      }
    });

    try {
      await transcode.encodeHLS("my_pipeline", "video.mp4");
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

    const result = await transcode.encodeHLS("my_pipeline", "video.mp4", false);

    expect(result).toBeDefined();
    expect(result?.split(",").length).toEqual(3);

    expect(result?.split(",")).toEqual([
      "hls-2m/video",
      "hls-1m/video",
      "hls-600k/video"
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

    const result = await transcode.encodeHLS("my_pipeline", "video.mp4", true);

    expect(result).toBeDefined();
    expect(result?.split(",").length).toEqual(4);

    expect(result?.split(",")).toEqual([
      "hls-2m/video",
      "hls-1m/video",
      "hls-600k/video",
      "hls-audio/video"
    ]);
  });
});

describe("Utility function encodeAudio()", () => {
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
      await transcode.encodeAudio("my_pipeline", "audio.mp3")
    ).toEqual("new_job_id");
  });

  it("should resolve the promise with undefined if job property is undefined", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {});
      }
    });

    try {
      await transcode.encodeAudio("my_pipeline", "audio.mp3");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("Job ID undefined");
    }
  });

  it("should reject the promise returning an error", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error) => void) => {
        callback(new Error("ERROR"));
      }
    });

    try {
      await transcode.encodeAudio("my_pipeline", "audio.mp3");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("ERROR");
    }
  });
});

describe("Utility function encodeHLSAudio()", () => {
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
      await transcode.encodeHLSAudio("my_pipeline", "audio.mp3")
    ).toEqual("new_job_id");
  });

  it("should resolve the promise with undefined if job property is undefined", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {});
      }
    });

    try {
      await transcode.encodeHLSAudio("my_pipeline", "audio.mp3");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("Job ID undefined");
    }
  });

  it("should reject the promise returning an error", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      createJob: (params: any, callback: (err: Error) => void) => {
        callback(new Error("ERROR"));
      }
    });

    try {
      await transcode.encodeHLSAudio("my_pipeline", "audio.mp3");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("ERROR");
    }
  });
});

describe("Utility function processInputPath()", () => {
  it("should return an input key separated into prefix, basename and extension", () => {
    const input = "prefix/basename.extension";
    const [ prefix, basename, extension ] = transcode.processInputPath(input);

    expect(prefix).toEqual("prefix/");
    expect(basename).toEqual("basename");
    expect(extension).toEqual("extension");
  });

  it("should return an empty string for prefix if the input has no prefix", () => {
    const input = "basename.extension";
    const [ prefix, basename, extension ] = transcode.processInputPath(input);

    expect(prefix).toEqual("");
    expect(basename).toEqual("basename");
    expect(extension).toEqual("extension");
  });

  it("should return an empty string for extension if the input has no extension", () => {
    const input = "prefix/basename";
    const [ prefix, basename, extension ] = transcode.processInputPath(input);

    expect(prefix).toEqual("prefix/");
    expect(basename).toEqual("basename");
    expect(extension).toEqual("");
  });

  it("should return an empty string for extension and prefix if the input has no extension or prefix", () => {
    const input = "basename";
    const [ prefix, basename, extension ] = transcode.processInputPath(input);

    expect(prefix).toEqual("");
    expect(basename).toEqual("basename");
    expect(extension).toEqual("");
  });

  it("should return the entire prefix if it contains multiple levels", () => {
    const input = "prefix/a/b/c/basename.extension";
    const [ prefix, basename, extension ] = transcode.processInputPath(input);

    expect(prefix).toEqual("prefix/a/b/c/");
    expect(basename).toEqual("basename");
    expect(extension).toEqual("extension");
  });

  it("should throw an exception if the basename is empty", () => {
    const input = "prefix/a/b/c/.extension";

    try {
      transcode.processInputPath(input);
      fail();
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toEqual("Input basename is empty");
    }
  });

  it("should throw an exception if the basename and prefix are empty", () => {
    const input = ".extension";

    try {
      transcode.processInputPath(input);
      fail();
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toEqual("Input basename is empty");
    }
  });

  it("should handle dots and spaces in a filename properly", () => {
    const input = "3b2187ba-d219-477e-9033-0a9b6a3b79fe.. household sounds.m4a";
    const [ prefix, basename, extension ] = transcode.processInputPath(input);

    expect(prefix).toEqual("");
    expect(basename).toEqual("3b2187ba-d219-477e-9033-0a9b6a3b79fe.. household sounds");
    expect(extension).toEqual("m4a");
  });
});

describe("Utility function getJobStatus()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should resolve the promise with the job status", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      readJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, { Job: { Status: "Progressing" } });
      }
    });

    expect(
      await transcode.getJobStatus("some_job_id")
    ).toEqual(["Progressing"]);
  });

  it("should resolve the promise with the job status and manifest path if job status is 'Complete'", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      readJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          Job: {
            Status: "Complete",
            OutputKeyPrefix: "/some/path/",
            Playlists: [{ Name: "some_manifest" }]
          }
        });
      }
    });

    expect(
      await transcode.getJobStatus("some_job_id")
    ).toEqual([
      "Complete",
      "/some/path/some_manifest.mpd"
    ]);
  });

  it("should reject with undefined if the job has no status field", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      readJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, { Job: { } });
      }
    });

    try {
      await transcode.getJobStatus("some_job_id");
      fail("No error caught");
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });

  it("should reject with undefined if the result is empty", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      readJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {});
      }
    });

    try {
      await transcode.getJobStatus("some_job_id");
      fail("No error caught");
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });

  it("should reject with undefined if the API returned an error", async () => {
    sinon.stub(aws, "ElasticTranscoder").returns({
      readJob: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(new Error("An error occurred"), {});
      }
    });

    try {
      await transcode.getJobStatus("some_job_id");
      fail("No error caught");
    } catch (e) {
      expect(e.message).toEqual("An error occurred");
    }
  });
});
