import { Request, Response, NextFunction } from "express";
import * as aws from "aws-sdk";

/**
 * Headers of an SNS subscription confirmation message
 */
interface SNSSubcriptionsHeaders {
  "x-amz-sns-topic-arn": string;
  "x-amz-sns-message-type": string;
}

/**
 * Body of an SNS subscription confirmation message
 */
interface SNSSubscriptionBody {
  Token: string;
}

/**
 * Middleware function which resets the HTTP content type of the request to
 * JSON if it contains the header `x-amz-sns-message-type`, i.e. is a message
 * from AWS SNS.
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Next function in call chain
 */
export function snsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.headers["x-amz-sns-message-type"]) {
    req.headers["content-type"] = "application/json;charset=UTF-8";
  }

  next();
}

/**
 * Subscribes to an SNS channel given an ARN, where messages are sent to the
 * given endpoint name, which should be a hostname which is publicly accessible
 * on the internet. Keep in mind that the subscription needs to be confirmed
 * first before messages are delivered. See `confirmSubscription()` for more
 * information.
 *
 * @param arn ARN of the channel to subscribe to
 * @param endpoint Address of the local endpoint to which messages are sent
 * @returns A promise which resolves with void or rejects with an error otherwise
 */
export function subscribeToSNSTopic(arn: string, endpoint: string): Promise<void> {
  const protocol = endpoint.split(":")[0];
  const sns = new aws.SNS();

  return new Promise((resolve, reject) => {
    sns.subscribe({
      Protocol: protocol,
      TopicArn: arn,
      Endpoint: endpoint
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Unsubscribes from an SNS channel identified by the given ARN.
 *
 * @param arn ARN of the channel to unsubscribe from
 * @returns A promise which resolves with void or rejects with an error otherwise
 */
export function unsubscribeFromSNSTopic(arn: string): Promise<void> {
  const sns = new aws.SNS();

  return new Promise((resolve, reject) => {
    sns.unsubscribe({
      SubscriptionArn: arn
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Confirms a previously issued subscription. This function should be called
 * with the headers and body of a confirmation request received on the endpoint
 * passed to `subscribeToSNSTopic()`. If the subscription is confirmed
 * successfully the function resolves to the new subscription's ARN or rejects
 * with an error otherwise.
 *
 * @param headers Headers of the confirmation request
 * @param body Body of the confirmation request
 * @returns A promise resolving to the confirmed subscription's ARN
 */
export function confirmSubscription(headers: SNSSubcriptionsHeaders, body: SNSSubscriptionBody): Promise<string>{
  const sns = new aws.SNS();

  return new Promise(((resolve, reject) =>{
    sns.confirmSubscription({
      TopicArn: headers["x-amz-sns-topic-arn"],
      Token: body.Token
    }, (err, res) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(res.SubscriptionArn);
      }
    });
  }));
}
