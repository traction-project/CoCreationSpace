import * as aws from "aws-sdk";

const [ BUCKET_NAME ] = getFromEnvironment("BUCKET_NAME");

/**
 * Tries to extract the values of the keys given as parameters from the
 * environment and throws an excaption if one of them cannot be found.
 *
 * @param keys Names of the keys that shall be extracted from the environment
 * @returns The values of the extracted keys as an array of strings
 */
export function getFromEnvironment(...keys: Array<string>): Array<string> {
  return keys.reduce<Array<string>>((values, k) => {
    const value = process.env[k];

    // Throw exception if value is not present in environment
    if (value === undefined) {
      throw new Error(`Environment has no key ${k}`);
    }

    return values.concat(value);
  }, []);
}

/**
 * Uploads a file to S3 and assigns it the given name. The name is an S3 key
 * path and can include a prefix. Optionally a target bucket name can be
 * specified. This value defaults to the value of the BUCKET_NAME environment
 * variable. Returns a void promise which resolves once the upload is complete
 * or rejects with an error otherwise.
 *
 * @param keyname Name that the file should be stored under in the S3 bucket
 * @param file Contents of the file to be uploaded
 * @param bucket Name of the bucket to store the file in. Optional, defaults to the BUCKET_NAME environment variable
 * @returns A promise which resolves upon completion
 */
export function uploadToS3(keyname: string, file: aws.S3.Body, bucket = BUCKET_NAME): Promise<void> {
  const s3 = new aws.S3();

  return new Promise((resolve, reject) => {
    s3.upload({
      Bucket: bucket, Key: keyname, Body: file
    }, {
      partSize: 5 * 1024 * 1024, queueSize: 10
    }, (err, data) => {
      if (err) {
        console.error("ERROR:", err);
        reject(err);
      } else {
        console.log(data);
        resolve();
      }
    });
  });
}
