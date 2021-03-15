import aws from "aws-sdk";
import path from "path";
import fs from "fs";
import { ModelCtor, Model, Op } from "sequelize";
import { Application } from "express";
import { createTransport } from "nodemailer";

import { UsersAttributes } from "../models/users";

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

/**
 * Lists all methods that are callable on a given object.
 * Useful for debugging association methods.
 *
 * @param toCheck Object to check
 */
export function getAllMethods(toCheck: any) {
  let props: Array<any> = [];
  let obj = toCheck;

  do {
    props = props.concat(Object.getOwnPropertyNames(obj));
    obj = Object.getPrototypeOf(obj);
  } while (obj);

  return props.sort().filter((e, i, arr) => {
    if (e != arr[i + 1] && typeof toCheck[e] == "function") {
      return true;
    }
  });
}

/**
 * Get Buffer from stream
 *
 * @param file Readable stream
 */
export async function streamToBuffer(file: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: any[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    file.on("data", (chunk) => chunks.push(chunk));
    file.on("error", (err) => reject(err));
    file.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Labelled tuple representing credentials for a SMTP server.
 */
type SMTPData = [
  host: string,
  port: number,
  user: string,
  pass: string
]

/**
 * Send an email with the given subject and body to the given recipient using
 * the given sender address. Authentication for the SMTP server needs to be
 * supplied as a string of the following shape:
 * "username password hostname port"
 *
 * The function returns a promise which resolves if the message was sent
 * successfully, or rejects with an error otherwise.
 *
 * @param sender The sender address
 * @param recipient The recipient address
 * @param subject The subject of the e-mail to be sent
 * @param body The body of the e-mail
 * @param smtpData An object containing STMP host, port, user and password
 * @returns A promise which resolves upon successful sending of the message
 */
export async function sendEmail(sender: string, recipient: string, subject: string, body: string, smtpData: SMTPData): Promise<void> {
  const [ host, port, user, pass ] = smtpData;

  const transport = createTransport({
    host, port,
    auth: {
      user, pass
    }
  });

  const message = {
    from: sender,
    to: recipient,
    subject: subject,
    html: body
  };

  return new Promise((resolve, reject) => {
    transport.sendMail(message, (err, info) => {
      if (err) {
        reject(err);
      } else {
        console.log(info);
        resolve();
      }
    });
  });
}

/**
 * Loads a template from the template directory by name and returns the
 * template contents as a string.
 *
 * @param app Reference to an Express application
 * @param templateName Name of the template to load
 * @returns The string contained in the template
 */
export async function loadTemplate(app: Application, templateName: string): Promise<string> {
  const viewDir = app.get("views");
  const engine = app.get("view engine");

  const templatePath = path.join(viewDir, `${templateName}.${engine}`);

  return new Promise((resolve, reject) => {
    fs.readFile(templatePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
}
