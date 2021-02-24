import aws from "aws-sdk";

/**
 * Starts a new video transcoding job in the given transcoding pipeline using
 * the given path as input. If the given input has no audio track, the third
 * parameter should be set to false, otherwise the transcoding job will fail.
 * Returns a promise which resolves to the job ID of the created transcoding
 * job or rejects with an error otherwise.
 *
 * The given input file is encoded into three output video streams with the
 * bitrates 4800k, 2400k and 1200k and one audio track (unless `hasAudio` is
 * set to false). Thumbnails will be generated as PNG files from the 4800k
 * video stream, with one thumbnail saved every 5 minutes.
 *
 * @param pipeline ID of the transcoding pipeline to use
 * @param input Path to input file
 * @param hasAudio Whether the file has an audio track, defaults to true
 * @returns A promise which resolves to the job ID if successful, rejects with an error otherwise
 */
export function encodeDash(pipeline: string, input: string, hasAudio = true): Promise<string | undefined> {
  // Get filename without extension
  const inputBasename = input.split(".")[0];

  // Transcoder configuration, outputs are placed under the path transcoded/,
  // with separate directories for each bitrate. Audio tracks and thumbnails
  // are also placed in separate directories. The manifest is placed directly
  // into the transcoded/ folder
  const params = {
    PipelineId: pipeline,
    Input: {
      Key: input,
    },
    OutputKeyPrefix: "transcoded/",
    Outputs: [
      {
        Key: `dash-4m/${inputBasename}`,
        PresetId: "1351620000001-500020",
        SegmentDuration: "10",
        ThumbnailPattern: `thumbnails/${inputBasename}_{count}`
      }, {
        Key: `dash-2m/${inputBasename}`,
        PresetId: "1351620000001-500030",
        SegmentDuration: "10"
      }, {
        Key: `dash-1m/${inputBasename}`,
        PresetId: "1351620000001-500040",
        SegmentDuration: "10"
      }, {
        Key: `dash-audio/${inputBasename}`,
        PresetId: "1351620000001-500060",
        SegmentDuration: "10"
      }
    ],
    Playlists: [
      {
        Format: "MPEG-DASH",
        Name: `${inputBasename}`,
        OutputKeys: [
          `dash-4m/${inputBasename}`,
          `dash-2m/${inputBasename}`,
          `dash-1m/${inputBasename}`,
          `dash-audio/${inputBasename}`,
        ],
      },
    ]
  };

  // Remove config for audio track from transcoding config if hasAudio is false
  if (!hasAudio) {
    params.Outputs = params.Outputs.slice(0, -1);
    params.Playlists[0].OutputKeys = params.Playlists[0].OutputKeys.slice(0, -1);
  }

  // Create and submit transcoding job
  return new Promise((resolve, reject) => {
    const transcoder = new aws.ElasticTranscoder();

    transcoder.createJob(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Job?.Id);
      }
    });
  });
}

/**
 * Starts a new audio transcoding job in the given transcoding pipeline using
 * the given path as input. Returns a promise which resolves to the job ID of
 * the created transcoding job or rejects with an error otherwise.
 *
 * The given input file is encoded into one output audio stream. If an audio
 * file is submitted as input, the video stream is discarded and only the audio
 * track is saved.
 *
 * @param pipeline ID of the transcoding pipeline to use
 * @param input Path to input file
 * @returns A promise which resolves to the job ID if successful, rejects with an error otherwise
 */
export function encodeAudio(pipeline: string, input: string): Promise<string> {
  // Get filename without extension
  const inputBasename = input.split(".")[0];

  // Transcoder configuration, outputs are placed under the path transcoded/,
  // whereas the manifest is placed directly into the transcoded/ folder
  const params = {
    PipelineId: pipeline,
    Input: {
      Key: input,
    },
    OutputKeyPrefix: "transcoded/",
    Outputs: [
      {
        Key: `dash-audio/${inputBasename}`,
        PresetId: "1351620000001-500060",
        SegmentDuration: "10"
      }
    ],
    Playlists: [
      {
        Format: "MPEG-DASH",
        Name: `${inputBasename}`,
        OutputKeys: [
          `dash-audio/${inputBasename}`
        ],
      },
    ]
  };

  // Create and submit transcoding job
  return new Promise((resolve, reject) => {
    const transcoder = new aws.ElasticTranscoder();

    transcoder.createJob(params, (err, data) => {
      if (err) {
        reject(err);
      } else if (!data.Job || !data.Job.Id) {
        reject(new Error("Job ID undefined"));
      } else {
        resolve(data.Job.Id);
      }
    });
  });
}
