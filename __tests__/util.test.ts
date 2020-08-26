import * as sinon from "sinon";
import * as aws from "aws-sdk";

import * as util from "../util";

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
    util.authRequired({ user: "something" } as any, {} as any, next);

    expect(next.called).toBeTruthy();
  });

  it("does not call the next() callback function if the request does not contain the property .user", () => {
    const next = sinon.fake();
    const res = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    util.authRequired({} as any, res as any, next);

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
      await util.translateCues([cue], "de");
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
      await util.translateCues(cues, "de");
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

    const translatedCues = await util.translateCues(cues, "de");

    expect(translatedCues.length).toEqual(cues.length);

    expect(translatedCues[0].cueStart).toEqual(cues[0].cueStart);
    expect(translatedCues[1].cueStart).toEqual(cues[1].cueStart);

    expect(translatedCues[0].cueEnd).toEqual(cues[0].cueEnd);
    expect(translatedCues[1].cueEnd).toEqual(cues[1].cueEnd);

    expect(translatedCues[0].cue).toEqual("Hallo");
    expect(translatedCues[1].cue).toEqual("Welt");
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
