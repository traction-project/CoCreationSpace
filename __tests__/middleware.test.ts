import sinon from "sinon";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const SESSION_SECRET = "sessionsecret";
process.env["SESSION_SECRET"] = SESSION_SECRET;

import setupAuth from "../auth/local";
import { authRequired, tokenRequired } from "../util/middleware";

describe("Utility function authRequired()", () => {
  it("calls the next() callback function if the request contains the property .user", () => {
    const next = sinon.fake();
    authRequired({ user: "something" } as any, {} as any, next);

    expect(next.called).toBeTruthy();
  });

  it("does not call the next() callback function if the request does not contain the property .user", () => {
    const next = sinon.fake();
    const res: Partial<Response> = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    authRequired({} as Request, res as Response, next);

    expect(next.called).toBeFalsy();

    expect((res.status as any).calledWith(401)).toBeTruthy();
    expect((res.send as any).calledWith({
      status: "ERR",
      message: "Authorisation required"
    })).toBeTruthy();
  });
});

describe("Utility function tokenRequired()", () => {
  beforeAll(async () => {
    await setupAuth();
  });

  it("should set the status code to 401 if there is no Authorization header", () => {
    const next = sinon.fake();

    const req: Partial<Request> = {
      headers: {}
    };

    const res: Partial<Response> = {
      status: sinon.spy(),
      send: sinon.spy(),
      end: sinon.spy()
    };

    tokenRequired(req as Request, res as Response, next);

    expect(next.called).toBeFalsy();
    expect(res.statusCode).toEqual(401);
  });

  it("should set the status code to 401 if the Authorization header contains invalid data", () => {
    const next = sinon.fake();

    const req: Partial<Request> = {
      headers: {
        authorization: "Bearer not_a_real_key"
      }
    };

    const res: Partial<Response> = {
      status: sinon.spy(),
      send: sinon.spy(),
      end: sinon.spy()
    };

    tokenRequired(req as Request, res as Response, next);

    expect(next.called).toBeFalsy();
    expect(res.statusCode).toEqual(401);
  });

  it("should set the status code to 401 is the Authorization header contains an invalid token", () => {
    const expirationDate = new Date().setDate(new Date().getDate() + 10);
    const token = jwt.sign({
      id: "some_id",
      username: "some_user",
      exp: Math.floor(expirationDate / 1000)
    }, "some_invalid_secret");

    const next = sinon.fake();

    const req: Partial<Request> = {
      headers: {
        authorization: "Bearer " + token
      }
    };

    const res: Partial<Response> = {
      status: sinon.spy(),
      send: sinon.spy(),
      end: sinon.spy()
    };

    tokenRequired(req as Request, res as Response, next);

    expect(next.called).toBeFalsy();
    expect(res.statusCode).toEqual(401);
  });

  it("should call the next function is a valid token is supplied", () => {
    const expirationDate = new Date().setDate(new Date().getDate() + 10);
    const token = jwt.sign({
      id: "some_id",
      username: "some_user",
      exp: Math.floor(expirationDate / 1000)
    }, SESSION_SECRET);

    const next = sinon.fake();

    const req: Partial<Request> = {
      headers: {
        authorization: "Bearer " + token
      }
    };

    const res: Partial<Response> = {
      status: sinon.spy(),
      send: sinon.spy(),
      end: sinon.spy()
    };

    tokenRequired(req as Request, res as Response, next);

    expect(next.called).toBeTruthy();
    expect((res.end as any).called).toBeFalsy();
  });
});
