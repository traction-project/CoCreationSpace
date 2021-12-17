import fs from "fs";
import sinon from "sinon";
import aws from "aws-sdk";
import nodemailer, { SentMessageInfo } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { PassThrough } from "stream";
import { Op } from "sequelize";

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

  it("should return the only the last extension if the filename has multiple extensions", () => {
    expect(util.getExtension("archive.tar.gz")).toEqual(".gz");
  });

  it("should return an empty string is the file has no extension", () => {
    expect(util.getExtension("some_strange_filename")).toEqual("");
  });

  it("should be able to handle dots in a filename correctly", () => {
    const input = "3b2187ba-d219-477e-9033-0a9b6a3b79fe.. household sounds.m4a";
    expect(util.getExtension(input)).toEqual(".m4a");
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

describe("Utility function streamToBuffer()", () => {
  it("should return buffer from readeablestream", async () => {
    const readable = new PassThrough();
    readable.push("test");
    readable.push(null);

    try {
      const buffer = await util.streamToBuffer(readable);

      expect(buffer).toBeDefined();
      expect(buffer).toBeInstanceOf(Buffer);
    } catch (error) {
      fail();
    }
  });

  it("should return catch error when stream emit error", async () => {
    const readable = new PassThrough();
    readable.push("test");

    try {
      setTimeout(() => {
        readable.emit("error", new Error());
      }, 100);

      await util.streamToBuffer(readable);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("Utility function splitIntoChunks()", () => {
  it("should return the whole text if the text is shorter than the chunk length", () => {
    const result = util.splitIntoChunks("Hello World");

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual("Hello World");
  });

  it("should preserve the final fullstop", () => {
    const result = util.splitIntoChunks("Hello World.");

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual("Hello World.");
  });

  it("should return the whole text if the text is equal to the chunk length", () => {
    const result = util.splitIntoChunks("Hello World", 11);

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual("Hello World");
  });

  it("should split the text into multiple chunks separated by fullstops if it is longer than the chunks length", () => {
    const result = util.splitIntoChunks("Hello World. What's going on?", 20);

    expect(result.length).toEqual(2);

    expect(result[0]).toEqual("Hello World.");
    expect(result[1]).toEqual(" What's going on?");

    expect(result.every((s) => s.length <= 20)).toBeTruthy();
  });
});

describe("Utility function isUser()", () => {
  it("should return false if the object is empty", () => {
    expect(util.isUser({})).toBeFalsy();
  });

  it("should return true if the object contains the property 'username'", () => {
    expect(util.isUser({ username: "admin" })).toBeTruthy();
    expect(util.isUser({ a: 1, b: true, username: "admin", otherKey: "something" })).toBeTruthy();
    expect(util.isUser({ username: true })).toBeTruthy();
  });
});

describe("Utility function sendEmail()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should resolve the promise", () => {
    sinon.stub(nodemailer, "createTransport").returns({
      sendMail: (msg: Mail.Options, callback: (err: Error | null, info: SentMessageInfo) => void) => {
        callback(null, "Message sent");
      }
    } as any);

    const smtp: util.SMTPData = [
      "smtp.example.com", 25,
      "smtpuser", "smtppass"
    ];

    expect(util.sendEmail(
      "a@example.com", "b@example.com",
      "Hello World"!, "Hello World",
      smtp)
    ).resolves.toBeUndefined();
  });

  it("should reject with an error", () => {
    const error = new Error("An error occurred");

    sinon.stub(nodemailer, "createTransport").returns({
      sendMail: (msg: Mail.Options, callback: (err: Error | null, info: SentMessageInfo) => void) => {
        callback(error, null);
      }
    } as any);

    const smtp: util.SMTPData = [
      "smtp.example.com", 25,
      "smtpuser", "smtppass"
    ];

    expect(util.sendEmail(
      "a@example.com", "b@example.com",
      "Hello World"!, "Hello World failure",
      smtp)
    ).rejects.toEqual(error);
  });
});


describe("Utility function getAllMethods()", () => {
  const prototypeMethods = [
    "__defineGetter__",
    "__defineSetter__",
    "__lookupGetter__",
    "__lookupSetter__",
    "constructor",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
    "toString",
    "valueOf"
  ];

  it("should only return prototype methods if an empty object is passed", () => {
    expect(util.getAllMethods({})).toEqual(prototypeMethods);
  });

  it("should return prototype methods plus the passed function name if an object with a function is passed", () => {
    const functions = util.getAllMethods({
      hello: () => {}
    });

    expect(functions.length).toEqual(prototypeMethods.length + 1);
    expect(functions.includes("hello")).toBeTruthy();
  });
});

describe("Utility function performOCR()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should resolve with a list of detected lines", async () => {
    sinon.stub(aws, "Rekognition").returns({
      detectText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TextDetections: [
            { Type: "LINE", DetectedText: "Hello", Confidence: 0.99 },
            { Type: "LINE", DetectedText: "World", Confidence: 0.95 }
          ]
        });
      }
    });

    const result = await util.performOCR("/some/path", "some_bucket");
    expect(result.length).toEqual(2);

    expect(result[0].line).toEqual("Hello");
    expect(result[0].confidence).toEqual(0.99);

    expect(result[1].line).toEqual("World");
    expect(result[1].confidence).toEqual(0.95);
  });

  it("should only resolve with a list of detected lines", async () => {
    sinon.stub(aws, "Rekognition").returns({
      detectText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TextDetections: [
            { Type: "WORD", DetectedText: "word", Confidence: 0.99 },
            { Type: "LINE", DetectedText: "line", Confidence: 0.95 },
            { Type: "WORD", DetectedText: "word", Confidence: 0.95 },
            { Type: "LINE", DetectedText: "line2", Confidence: 0.95 }
          ]
        });
      }
    });

    const result = await util.performOCR("/some/path", "some_bucket");
    expect(result.length).toEqual(2);

    expect(result[0].line).toEqual("line");
    expect(result[0].confidence).toEqual(0.95);

    expect(result[1].line).toEqual("line2");
    expect(result[1].confidence).toEqual(0.95);
  });

  it("should resolve with an empty list of the response doesn't contain the key TextDetections", async () => {
    sinon.stub(aws, "Rekognition").returns({
      detectText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {});
      }
    });

    const result = await util.performOCR("/some/path", "some_bucket");
    expect(result.length).toEqual(0);
  });

  it("should resolve with an empty list of the response doesn't any lines", async () => {
    sinon.stub(aws, "Rekognition").returns({
      detectText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(null, {
          TextDetections: []
        });
      }
    });

    const result = await util.performOCR("/some/path", "some_bucket");
    expect(result.length).toEqual(0);
  });

  it("should reject if the error object is not null", async () => {
    sinon.stub(aws, "Rekognition").returns({
      detectText: (params: any, callback: (err: Error | null, data: any) => void) => {
        callback(new Error("An error occurred"), null);
      }
    });

    try {
      await util.performOCR("/some/path", "some_bucket");
      fail("No error caught");
    } catch (e) {
      expect(e.message).toEqual("An error occurred");
    }
  });
});

describe("Utility function generateHasManyAssociationMethods()", () => {
  it("should generate the names of association methods for the given input", () => {
    const result = util.generateHasManyAssociationMethods("User");

    expect(result.length).toEqual(10);

    expect(result).toContain("getUsers");
    expect(result).toContain("setUsers");
    expect(result).toContain("countUsers");
    expect(result).toContain("hasUsers");
    expect(result).toContain("addUsers");
    expect(result).toContain("removeUsers");

    expect(result).toContain("hasUser");
    expect(result).toContain("addUser");
    expect(result).toContain("createUser");
    expect(result).toContain("removeUser");
  });
});

describe("Utility function generateBelongsToAssociationMethods()", () => {
  it("should generate the names of association methods for the given input", () => {
    const result = util.generateBelongsToAssociationMethods("User");

    expect(result.length).toEqual(3);

    expect(result).toContain("getUser");
    expect(result).toContain("setUser");
    expect(result).toContain("createUser");
  });
});

describe("Utility function generateHasOneAssociationMethods()", () => {
  it("should generate the names of association methods for the given input", () => {
    const result = util.generateHasOneAssociationMethods("User");

    expect(result.length).toEqual(3);

    expect(result).toContain("getUser");
    expect(result).toContain("setUser");
    expect(result).toContain("createUser");
  });
});

describe("Utility function loadTemplate()", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should resolve with a string", async () => {
    sinon.stub(fs, "readFile").yields(null, "Hello World!");

    const result = await util.loadTemplate({
      get: () => ""
    } as any, "some_template");

    expect(result).toEqual("Hello World!");
  });

  it("should reject with an error if the error value to readFile is not null", async () => {
    sinon.stub(fs, "readFile").yields(new Error("An error occurred"), "Hello World!");

    try {
      await util.loadTemplate({
        get: () => ""
      } as any, "some_template");
      fail("No error caught");
    } catch (e) {
      expect(e.message).toEqual("An error occurred");
    }
  });
});

describe("Utility function buildCriteria()", () => {
  it("should return an empty object if no query is supplied", async () => {
    const result = await util.buildCriteria({}, {
      describe: () => {}
    } as any);

    expect(result).toEqual({});
  });

  it("should return an empty object if the query is empty", async () => {
    const result = await util.buildCriteria({ q: "" }, {
      describe: () => {}
    } as any);

    expect(result).toEqual({});
  });

  it("should return an object with an empty where key if the given model only has unsupported fields", async () => {
    const result: any = await util.buildCriteria({ q: "test" }, {
      describe: () => {
        return {
          id: { type: "UUID" },
          updated_at: { type: "DATETIME" },
          created_at: { type: "DATETIME" },
        };
      }
    } as any);

    expect(result.where).toBeDefined();
    expect(result.where).toEqual({});
  });

  it("should return an object with an empty where key if the given model has a single TIMESTAMP field", async () => {
    const result: any = await util.buildCriteria({ q: "test" }, {
      describe: () => {
        return {
          updated_at: { type: "TIMESTAMP" },
        };
      }
    } as any);

    expect(result.where).toBeDefined();
    expect(result.where).toEqual({});
  });

  it("should return an object with a where condition matching the integer if the model has a single INTEGER field", async () => {
    const result: any = await util.buildCriteria({ q: "12" }, {
      describe: () => {
        return {
          number: { type: "INTEGER" },
        };
      }
    } as any);

    expect(result.where).toBeDefined();
    expect(result.where.number).toBeDefined();
    expect(result.where.number).toEqual({
      [Op.iLike]: 12
    });
  });

  it("should return an object with a an empty where condition if the query value cannot be parsed as a number", async () => {
    const result: any = await util.buildCriteria({ q: "test" }, {
      describe: () => {
        return {
          number: { type: "INTEGER" },
        };
      }
    } as any);

    expect(result.where).toBeDefined();
    expect(result.where).toEqual({});
  });

  it("should return an object with a where condition matching the string using LIKE if the model has a single CHARACTER field", async () => {
    const result: any = await util.buildCriteria({ q: "test" }, {
      describe: () => {
        return {
          title: { type: "CHARACTER" },
        };
      }
    } as any);

    expect(result.where).toBeDefined();
    expect(result.where.title).toBeDefined();
    expect(result.where.title).toEqual({
      [Op.iLike]: "%test%"
    });
  });

  it("should return an object with a where condition matching the string using LIKE if the model has a single TEXT field", async () => {
    const result: any = await util.buildCriteria({ q: "test" }, {
      describe: () => {
        return {
          title: { type: "TEXT" },
        };
      }
    } as any);

    expect(result.where).toBeDefined();
    expect(result.where.title).toBeDefined();
    expect(result.where.title).toEqual({
      [Op.iLike]: "%test%"
    });
  });

  it("should return an object with where conditions for fields with supported data types", async () => {
    const result: any = await util.buildCriteria({ q: "test" }, {
      describe: () => {
        return {
          description: { type: "TEXT" },
          user: { type: "TEXT" },
          title: { type: "CHARACTER" },
          id: { type: "UUID" },
          number: { type: "INTEGER" },
          updated_at: { type: "DATETIME" },
          created_at: { type: "DATETIME" },
        };
      }
    } as any);

    expect(result.where).toBeDefined();
    expect(Object.getOwnPropertyNames(result.where).length).toEqual(3);

    expect(result.where.title).toBeDefined();
    expect(result.where.description).toBeDefined();
    expect(result.where.user).toBeDefined();
  });

  it("should return an object with where conditions for fields with supported data types including numeric fields if the query can be parsed as number", async () => {
    const result: any = await util.buildCriteria({ q: "42" }, {
      describe: () => {
        return {
          description: { type: "TEXT" },
          user: { type: "TEXT" },
          title: { type: "CHARACTER" },
          id: { type: "UUID" },
          number: { type: "INTEGER" },
          updated_at: { type: "DATETIME" },
          created_at: { type: "DATETIME" },
        };
      }
    } as any);

    expect(result.where).toBeDefined();
    expect(Object.getOwnPropertyNames(result.where).length).toEqual(4);

    expect(result.where.title).toBeDefined();
    expect(result.where.description).toBeDefined();
    expect(result.where.user).toBeDefined();
    expect(result.where.number).toBeDefined();
  });
});
