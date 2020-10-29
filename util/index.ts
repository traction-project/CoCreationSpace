import { Request, Response, NextFunction } from "express";
import jwt from "express-jwt";
import aws from "aws-sdk";

import { ModelCtor, Model, Op } from "sequelize";
import { UsersAttributes } from "models/users";

/**
 * Returns a list containing all integers between the given start point and end
 * point. If the values for start and end are equal, an empty list is returned.
 * If the end point is less than the start point, a descending list is returned,
 * otherwise an ascending list is returned.
 *
 * @param start Start point of the range (inclusive)
 * @param end End point of the range (exclusive)
 * @returns A list with all integers between start and end
 */
export function Range(start: number, end: number) {
  if (start === end) {
    return [];
  }

  if (end < start) {
    return new Array(start - end).fill(null).map((_, i) => {
      return start - i;
    });
  }

  return new Array(end - start).fill(null).map((_, i) => {
    return start + i;
  });
}

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
 * Returns the extension of a given filename with a leading dot. If the given
 * filename has no extension, an empty string is returned.
 *
 * @param filename Filename to get extension from
 * @returns The file extension or an empty string is the filename has no extension
 */
export function getExtension(filename: string): string {
  const parts = filename.split(".");

  if (parts.length == 1) {
    return "";
  }

  return "." + parts.slice(1).join(".");
}

/**
 * Translates a given text to the given target language. By default, the
 * language of the input text is determined automatically, but the language
 * of the input text can be set manually, by passing in a language code as
 * third parameter.
 *
 * @param input Text to translate
 * @param targetLanguage Code of the language to translate into
 * @param sourceLanguage Language of the input string, defaults to 'auto'
 * @returns A promise which resolves to the translated text or an error otherwise
 */
export function translateText(input: string, targetLanguage: string, sourceLanguage = "auto"): Promise<string> {
  const params: aws.Translate.TranslateTextRequest = {
    SourceLanguageCode: sourceLanguage,
    TargetLanguageCode: targetLanguage,
    Text: input
  };

  return new Promise((resolve, reject) => {
    const translate = new aws.Translate();

    translate.translateText(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.TranslatedText);
      }
    });
  });
}

/**
 * Middleware function which makes routes which it is applied to require a
 * means of authentication. This authentication needs to be supplied as a JSON
 * Web Token stored in the `Authorization` HTTP header.
 *
 * @returns a JWT request handler which can be used as middleware function
 */
export function tokenRequired(): jwt.RequestHandler {
  const [ SESSION_SECRET ] = getFromEnvironment("SESSION_SECRET");

  return jwt({
    secret: SESSION_SECRET,
  });
}

/**
 * Middleware function which makes routes which it is applied to require a
 * an active session, achieved through a session cookie.
 *
 * @returns a JWT request handler which can be used as middleware function
 */
export function authRequired(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next();
  } else {
    res.status(401);
    res.send({
      status: "ERR",
      message: "Authorisation required"
    });
  }
}

/**
 * Check if value include the term.
 * @param value string to check
 * @param term string to check if it is include in the other one
 */
export const findTerm = (value: string, term: string): string => {
  if (value.includes(term)){
    return value;
  }
  return "";
};

/**
 * Check if the model attribute type and return the value casted with that typ
 * @param value string from request query param
 * @param type model attribute type
 */
const castType = (value: string, type: string) => {
  switch(type) {
  case findTerm(type, "INTEGER"):
    return parseInt(value);
  case findTerm(type, "CHARACTER"):
    return `%${value}%`;
  case findTerm(type, "TIMETAMP"):
    return "";
  default:
    return "";
  }
};

/**
 * Generate the query to do it with the DB. Get the request params and depending of its value, genare the query with operators like: order, limit, pagination or where
 * @param q : request params
 * @param model Model where to do the query
 */
export const buildCriteria = async ({ q }: { q?: string }, model: ModelCtor<Model>)  => {
  const criteria = {};

  if (q) {
    const where: { where: { [key: string]: any } } = { where: {} };
    const modelSchema: { [key: string]: any } = await model.describe();

    Object.keys(modelSchema).forEach((key) => {
      const castValue = castType(q, modelSchema[key].type);
      if (castValue) {
        const operator = { [Op.iLike]: castValue};
        where.where[key] = operator;
      }
    });

    Object.assign(criteria, where);
  }
  return criteria;
};

/**
 * Check if the object is an instance of UserAttributes
 * @param object
 */
export const isUser = (object: any): object is UsersAttributes => {
  return "username" in object;
};
