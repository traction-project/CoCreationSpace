import { Sequelize } from "sequelize";
import sinon from "sinon";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const SESSION_SECRET = "sessionsecret";
process.env["SESSION_SECRET"] = SESSION_SECRET;
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../models";
import setupAuth from "../auth/local";
import { authRequired, permissionRequired, tokenRequired } from "../util/middleware";

describe("Middleware function authRequired()", () => {
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

describe("Middleware function tokenRequired()", () => {
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

describe("Middleware function permissionRequired()", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { User, Permission } = db.getModels();

    await User.destroy({ truncate: true });
    await Permission.destroy({ truncate: true });
  });

  it("does not call the next() callback function if the request does not contain the property .user", () => {
    const next = sinon.fake();
    const res: Partial<Response> = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    const middleware = permissionRequired();
    middleware({} as Request, res as Response, next);

    expect(next.called).toBeFalsy();

    expect((res.status as any).calledWith(401)).toBeTruthy();
    expect((res.send as any).calledWith({
      status: "ERR",
      message: "Authorisation required"
    })).toBeTruthy();
  });

  it("does call the next() callback function if the request does contains the property .user and no special permissions are required", () => {
    const next = sinon.fake();

    const req: Partial<Request> = {
      user: "some_user"
    };

    const res: Partial<Response> = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    const middleware = permissionRequired();
    middleware(req as Request, res as Response, next);

    expect(next.called).toBeTruthy();
  });

  it("does call the next() callback function if the request does contains the property .user and the user has the permissions", async (done) => {
    const { User, Permission } = db.getModels();

    const user = await User.create({ username: "some_user" });
    const permission1 = await Permission.create({ type: "some_permission" });
    const permission2 = await Permission.create({ type: "some_other_permission" });
    await user.addPermissions([permission1, permission2]);

    const next = sinon.stub();
    next.callsFake(() => {
      expect(next.called).toBeTruthy();
      done();
    });

    const req: Partial<Request> = {
      user
    };

    const res: Partial<Response> = {
      status: sinon.spy(),
      send: sinon.spy()
    };

    const middleware = permissionRequired("some_permission", "some_other_permission");
    middleware(req as Request, res as Response, next);

    expect.assertions(1);
  });

  it("sets the status code to 403 if the request does contains the property .user but the user does not have the required permissions", async (done) => {
    const { User, Permission } = db.getModels();

    const user = await User.create({ username: "some_user" });
    const permission1 = await Permission.create({ type: "some_permission" });
    await user.addPermission(permission1);

    const next = sinon.stub();

    const req: Partial<Request> = {
      user
    };

    const statusStub = sinon.stub();
    statusStub.callsFake((arg) => {
      expect(arg).toEqual(403);
      done();
    });

    const res: Partial<Response> = {
      status: statusStub,
      send: sinon.spy()
    };

    const middleware = permissionRequired("some_permission", "some_other_permission");
    middleware(req as Request, res as Response, next);

    expect(next.called).toBeFalsy();
    expect.assertions(2);
  });
});
