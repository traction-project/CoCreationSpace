import * as sinon from "sinon";
import * as aws from "aws-sdk";

import * as s3 from "../util/s3";

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

describe("Utility function deleteFromS3()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should resolve the promise", async () => {
    sinon.stub(aws, "S3").returns({
      deleteObject: (a: any, callback: () => void) => {
        callback();
      }
    });

    expect(
      await s3.deleteFromS3("some/key", "some_bucket")
    ).toBeUndefined();
  });

  it("should reject the promise returning an error", async () => {
    sinon.stub(aws, "S3").returns({
      deleteObject: (a: any, callback: (err: any) => void) => {
        callback(new Error("ERROR"));
      }
    });

    try {
      await s3.deleteFromS3("some/key", "some_bucket");
      fail();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual("ERROR");
    }
  });
});
