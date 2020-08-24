import { TranscribeOutput } from "../../util/transcribe";

export const emptyResponse: TranscribeOutput = {
  "jobName": "test1",
  "accountId": "257610463977",
  "results": {
    "transcripts": [
      {
        "transcript": ""
      }
    ],
    "speaker_labels": {
      "speakers": 0,
      "segments": []
    },
    "items": []
  }
};

export const singleCue: TranscribeOutput = {
  "jobName": "test1",
  "accountId": "257610463977",
  "results": {
    "transcripts": [
      {
        "transcript": ""
      }
    ],
    "speaker_labels": {
      "speakers": 0,
      "segments": []
    },
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

export const multipleCues: TranscribeOutput = {
  "jobName": "test1",
  "accountId": "257610463977",
  "results": {
    "transcripts": [
      {
        "transcript": ""
      }
    ],
    "speaker_labels": {
      "speakers": 0,
      "segments": []
    },
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

export const multipleCuesOverMinute: TranscribeOutput = {
  "jobName": "test1",
  "accountId": "257610463977",
  "results": {
    "transcripts": [
      {
        "transcript": ""
      }
    ],
    "speaker_labels": {
      "speakers": 0,
      "segments": []
    },
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
        "start_time": "64.00",
        "end_time": "64.23",
        "alternatives": [
          {
            "content": "How",
            "confidence": "0.99"
          }
        ]
      },
      {
        "type": "pronunciation",
        "start_time": "64.30",
        "end_time": "64.37",
        "alternatives": [
          {
            "content": "are",
            "confidence": "0.99"
          }
        ]
      },
      {
        "type": "pronunciation",
        "start_time": "64.42",
        "end_time": "64.50",
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

export const splitCues: TranscribeOutput = {
  "jobName": "test1",
  "accountId": "257610463977",
  "results": {
    "transcripts": [
      {
        "transcript": ""
      }
    ],
    "speaker_labels": {
      "speakers": 0,
      "segments": []
    },
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
