import aws from "aws-sdk";

/**
 * Separates an Amazon S3 key into a tuple with separate elements for prefix
 * path, file basename and file extension.
 *
 * @param input Name of the input with prefix path and extension
 * @returns A tuple with an element for prefix path, file basename and extension
 */
export function processInputPath(input: string): [ prefix: string, basename: string, extension: string ] {
  const pathComponents = input.split("/");

  // Get filename without path prefix
  const inputFilename = pathComponents[pathComponents.length - 1];

  // Reassemble path prefix
  let prefixPath = pathComponents.slice(0, pathComponents.length - 1).join("/");

  // Append slash at end of prefix if it is non-empty
  if (prefixPath.length > 0) {
    prefixPath += "/";
  }

  const filenameComponents = inputFilename.split(".");

  if (filenameComponents[0].length == 0) {
    throw new Error("Input basename is empty");
  }

  if (filenameComponents.length == 1) {
    return [prefixPath, filenameComponents[0], ""];
  } else {
    // Get filename without extension
    const inputBasename = filenameComponents.slice(0, filenameComponents.length - 1).join(".");
    // Get extension
    const extension = filenameComponents[filenameComponents.length - 1];

    return [prefixPath, inputBasename, extension];
  }
}

/**
 * Starts a new DASH video transcoding job in the given transcoding pipeline
 * using the given path as input. If the given input has no audio track, the
 * third parameter should be set to false, otherwise the transcoding job will
 * fail. Returns a promise which resolves to the job ID of the created
 * transcoding job or rejects with an error otherwise.
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
  // Process input path
  const [ prefixPath, inputBasename ] = processInputPath(input);

  // Transcoder configuration, outputs are placed under the path transcoded/,
  // with separate directories for each bitrate. Audio tracks and thumbnails
  // are also placed in separate directories. The manifest is placed directly
  // into the transcoded/ folder
  const params = {
    PipelineId: pipeline,
    Input: {
      Key: input,
    },
    OutputKeyPrefix: `${prefixPath}transcoded/`,
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
      }
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
 * Starts a new HLS video transcoding job in the given transcoding pipeline
 * using the given path as input. If the given input has no audio track, the
 * third parameter should be set to false, otherwise the transcoding job will
 * fail. Returns a promise which resolves to the job ID of the created
 * transcoding job or rejects with an error otherwise.
 *
 * The given input file is encoded into three output video streams with the
 * bitrates 2M, 1M and 600k and one audio track (unless `hasAudio` is set to
 * false). Thumbnails will be generated as PNG files from the 2M video stream,
 * with one thumbnail saved every 5 minutes.
 *
 * @param pipeline ID of the transcoding pipeline to use
 * @param input Path to input file
 * @param hasAudio Whether the file has an audio track, defaults to true
 * @returns A promise which resolves to the job ID if successful, rejects with an error otherwise
 */
export function encodeHLS(pipeline: string, input: string, hasAudio = true): Promise<string | undefined> {
  // Process input path
  const [ prefixPath, inputBasename ] = processInputPath(input);

  // Transcoder configuration, outputs are placed under the path transcoded/,
  // with separate directories for each bitrate. Audio tracks and thumbnails
  // are also placed in separate directories. The manifest is placed directly
  // into the transcoded/ folder
  const params = {
    PipelineId: pipeline,
    Input: {
      Key: input,
    },
    OutputKeyPrefix: `${prefixPath}transcoded/`,
    Outputs: [
      {
        Key: `hls-2m/${inputBasename}`,
        PresetId: "1351620000001-200015",
        SegmentDuration: "10",
        ThumbnailPattern: `thumbnails/${inputBasename}_{count}`
      }, {
        Key: `hls-1m/${inputBasename}`,
        PresetId: "1351620000001-200035",
        SegmentDuration: "10"
      }, {
        Key: `hls-600k/${inputBasename}`,
        PresetId: "1351620000001-200045",
        SegmentDuration: "10"
      }, {
        Key: `hls-audio/${inputBasename}`,
        PresetId: "1351620000001-200060",
        SegmentDuration: "10"
      }
    ],
    Playlists: [
      {
        Format: "HLSv4",
        Name: `${inputBasename}`,
        OutputKeys: [
          `hls-2m/${inputBasename}`,
          `hls-1m/${inputBasename}`,
          `hls-600k/${inputBasename}`,
          `hls-audio/${inputBasename}`,
        ],
      }
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
 * Starts a new DASH audio transcoding job in the given transcoding pipeline
 * using the given path as input. Returns a promise which resolves to the job
 * ID of the created transcoding job or rejects with an error otherwise.
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
  // Process input path
  const [ prefixPath, inputBasename ] = processInputPath(input);

  // Transcoder configuration, outputs are placed under the path transcoded/,
  // whereas the manifest is placed directly into the transcoded/ folder
  const params = {
    PipelineId: pipeline,
    Input: {
      Key: input,
    },
    OutputKeyPrefix: `${prefixPath}transcoded/`,
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
      }
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

/**
 * Starts a new HLS audio transcoding job in the given transcoding pipeline
 * using the given path as input. Returns a promise which resolves to the job
 * ID of the created transcoding job or rejects with an error otherwise.
 *
 * The given input file is encoded into one output audio stream. If an audio
 * file is submitted as input, the video stream is discarded and only the audio
 * track is saved.
 *
 * @param pipeline ID of the transcoding pipeline to use
 * @param input Path to input file
 * @returns A promise which resolves to the job ID if successful, rejects with an error otherwise
 */
export function encodeHLSAudio(pipeline: string, input: string): Promise<string> {
  // Process input path
  const [ prefixPath, inputBasename ] = processInputPath(input);

  // Transcoder configuration, outputs are placed under the path transcoded/,
  // whereas the manifest is placed directly into the transcoded/ folder
  const params = {
    PipelineId: pipeline,
    Input: {
      Key: input,
    },
    OutputKeyPrefix: `${prefixPath}transcoded/`,
    Outputs: [
      {
        Key: `hls-audio/${inputBasename}`,
        PresetId: "1351620000001-200060",
        SegmentDuration: "10"
      }
    ],
    Playlists: [
      {
        Format: "HLSv4",
        Name: `${inputBasename}`,
        OutputKeys: [
          `hls-audio/${inputBasename}`
        ],
      }
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

/**
 * Returns the status of the transcoding job with the given ID.
 *
 * @param jobId Transcoding job ID which should be checked
 * @returns The job status, may be one of `Submitted`, `Progressing`, `Complete`, `Canceled`, or `Error`
 */
export function getJobStatus(jobId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const transcoder = new aws.ElasticTranscoder();

    transcoder.readJob({ Id: jobId }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (data.Job?.Status) {
          resolve(data.Job.Status);
        } else {
          reject(undefined);
        }
      }
    });
  });
}
