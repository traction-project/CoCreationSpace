import * as util from "../util";

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

describe("Utility function transcribeOutputToVTT()", () => {
  it("should produce a file with only a header on empty input", () => {
    const testInput = {
      "jobName": "test1",
      "accountId": "257610463977",
      "results": {
        "transcripts": [
          {
            "transcript": ""
          }
        ],
        "items": []
      }
    };

    expect(util.transcribeOutputToVTT(testInput)).toEqual("VTT");
  });

  it("should produce a file with a single cue with a single sentence in the input", () => {
    const testInput: util.TranscribeOutput = {
      "jobName": "test1",
      "accountId": "257610463977",
      "results": {
        "transcripts": [
          {
            "transcript": ""
          }
        ],
        "items": [
          {
            "type": "pronunciation",
            "start_time": "0.00",
            "end_time": "0.56",
            "alternatives": [
              {
                "content": "Hello",
                "confidence": "0.99"
              }
            ]
          },
          {
            "type": "punctuation",
            "alternatives": [
              {
                "content": ","
              }
            ]
          },
          {
            "type": "pronunciation",
            "start_time": "0.62",
            "end_time": "0.84",
            "alternatives": [
              {
                "content": "World",
                "confidence": "0.99"
              }
            ]
          },
          {
            "type": "punctuation",
            "alternatives": [
              {
                "content": "!"
              }
            ]
          },
        ]
      }
    };

    expect(util.transcribeOutputToVTT(testInput)).toEqual(
      "VTT\n" +
      "\n" +
      "0.00 --> 0.84\n" +
      "Hello, World!"
    );
  });

  it("should produce a file with multiple cues with multiple sentences in the input", () => {
    const testInput: util.TranscribeOutput = {
      "jobName": "test1",
      "accountId": "257610463977",
      "results": {
        "transcripts": [
          {
            "transcript": ""
          }
        ],
        "items": [
          {
            "type": "pronunciation",
            "start_time": "0.00",
            "end_time": "0.56",
            "alternatives": [
              {
                "content": "Hello",
                "confidence": "0.99"
              }
            ]
          },
          {
            "type": "punctuation",
            "alternatives": [
              {
                "content": ","
              }
            ]
          },
          {
            "type": "pronunciation",
            "start_time": "0.62",
            "end_time": "0.84",
            "alternatives": [
              {
                "content": "World",
                "confidence": "0.99"
              }
            ]
          },
          {
            "type": "punctuation",
            "alternatives": [
              {
                "content": "!"
              }
            ]
          },
          {
            "type": "pronunciation",
            "start_time": "1.00",
            "end_time": "1.23",
            "alternatives": [
              {
                "content": "How",
                "confidence": "0.99"
              }
            ]
          },
          {
            "type": "pronunciation",
            "start_time": "1.30",
            "end_time": "1.37",
            "alternatives": [
              {
                "content": "are",
                "confidence": "0.99"
              }
            ]
          },
          {
            "type": "pronunciation",
            "start_time": "1.42",
            "end_time": "1.50",
            "alternatives": [
              {
                "content": "you",
                "confidence": "0.99"
              }
            ]
          },
          {
            "type": "punctuation",
            "alternatives": [
              {
                "content": "?"
              }
            ]
          },
        ]
      }
    };

    expect(util.transcribeOutputToVTT(testInput)).toEqual(
      "VTT\n" +
      "\n" +
      "0.00 --> 0.84\n" +
      "Hello, World!\n" +
      "\n" +
      "1.00 --> 1.50\n" +
      "How are you?"
    );
  });
});
