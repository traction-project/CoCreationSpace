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
