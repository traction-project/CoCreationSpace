import sinon from "sinon";
import aws from "aws-sdk";
import { PassThrough } from "stream";

process.env["SESSION_SECRET"] = "sessionsecret";

import * as util from "../util";
import { authRequired } from "../util/middleware";

describe("Utility function Range()", () => {
  it("should return and empty array is start is equal to end", () => {
    expect(util.Range(2, 2)).toEqual([]);
  });

  it("should return a list containing all integers from start (inclusive) to end (exclusive)", () => {
    expect(util.Range(1, 5)).toEqual([1, 2, 3, 4]);
  });

  it("should return a descending range if end is smaller than start", () => {
    expect(util.Range(5, 1)).toEqual([5, 4, 3, 2]);
  });

  it("should return an ascending range with negative numbers when start and end are negative", () => {
    expect(util.Range(-5, -1)).toEqual([-5, -4, -3, -2]);
  });

  it("should return an ascending range with negative and positive numbers when start is negative and end is positive", () => {
    expect(util.Range(-5, 5)).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]);
  });

  it("should return an descending range with negative and positive numbers when start is positive and end is negative", () => {
    expect(util.Range(5, -5)).toEqual([5, 4, 3, 2, 1, 0, -1, -2, -3, -4]);
  });
});

describe("Utility function authRequired()", () => {
  it("calls the next() callback function if the request contains the property .user", () => {
    const next = sinon.fake();
    authRequired({ user: "something" } as any, {} as any, next);

    expect(next.called).toBeTruthy();
  });

  it("does not call the next() callback function if the request does not contain the property .user", () => {
    const next = sinon.fake();
    const res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    authRequired({} as any, res as any, next);

    expect(next.called).toBeFalsy();

    expect(res.status.calledWith(401)).toBeTruthy();
    expect(res.send.calledWith({
      status: "ERR",
      message: "Authorisation required"
    })).toBeTruthy();
  });
});

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

describe("Utility function findTerm()", () => {

  const text = "hello world";

  it("should return the text if includes substring", () => {
    const substring = "hello";

    const result = util.findTerm(text, substring);

    expect(result).toBe(text);
  });

  it("should return empty string if text doesn't includes substring", () => {
    const substring = "test";

    const result = util.findTerm(text, substring);

    expect(result).toBe("");
  });
});

describe("Utility function streamToBuffer()", () =>{

  it("should return buffer from readeablestream", async () => {
    const readable = new PassThrough();
    readable.push("test");
    readable.push(null);
    try {
      const buffer = await util.streamToBuffer(readable);

      expect(buffer).toBeDefined();
      expect(buffer).toBeInstanceOf(Buffer);
    } catch(error) {
      fail();
    }
  });

  it("should return catch error when stream emit error", async () => {
    const readable = new PassThrough();
    readable.push("test");
    try {
      util.streamToBuffer(readable);
      readable.emit("error", new Error());
    } catch(error) {
      expect(error).toBeDefined();
    }
  });
});
