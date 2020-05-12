import * as aws from "aws-sdk";

const [ BUCKET_NAME ] = getFromEnvironment("BUCKET_NAME");

export function getFromEnvironment(...keys: Array<string>): Array<string> {
  return keys.reduce<Array<string>>((values, k) => {
    const value = process.env[k];

    if (value === undefined) {
      throw new Error(`Environment has no key ${k}`);
    }

    return values.concat(value);
  }, []);
}

export function uploadToS3(filename: string, file: aws.S3.Body, bucket = BUCKET_NAME): Promise<void> {
  const s3 = new aws.S3();

  return new Promise((resolve, reject) => {
    s3.upload({
      Bucket: bucket, Key: filename, Body: file
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
