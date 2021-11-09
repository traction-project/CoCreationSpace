import { Sequelize } from "sequelize";

import { UserAttributes } from "models/user";
import { getAllMethods, generateBelongsToAssociationMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("ConsentForm model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);

    const { User } = db.getModels();
    await User.create({
      username: "admin"
    });
  });

  beforeEach(async () => {
    const { ConsentForm } = db.getModels();
    await ConsentForm.destroy({ truncate: true });
  });

  it("should create an empty ConsentForm entry", async () => {
    const { ConsentForm } = db.getModels();

    const form = await ConsentForm.create({});

    expect(form).toBeDefined();
    expect(form.id).toBeDefined();
    expect(form.data).toBeUndefined();
    expect(form.user).toBeUndefined();
  });

  it("should create a consent form entry and associate it to a user", async () => {
    const { ConsentForm, User } = db.getModels();

    const user = await User.findOne({ where: { username: "admin" }});
    const form = await ConsentForm.build({
      data: { text: "Hello World" }
    }).save();

    await form.setUser(user!);

    const newForm = await ConsentForm.findOne({ include: ["user"] });

    expect(newForm).toBeDefined();
    expect(newForm!.user).toBeDefined();
  });

  it("should create a consent form entry and retrieve the user through the getUser method", async () => {
    const { ConsentForm, User } = db.getModels();

    const user = await User.findOne({ where: { username: "admin" }});
    const form = await ConsentForm.build({
      data: { text: "Hello World" }
    }).save();

    await form.setUser(user!);
    const formUser = await form.getUser();

    expect(formUser).toBeDefined();
    expect(formUser.username).toEqual("admin");
  });

  it("should create a consent form and set the user through user id", async () => {
    const { ConsentForm, User } = db.getModels();

    const user = (await User.findOne({ where: { username: "admin" }}))!;
    const form = await ConsentForm.build({
      data: { text: "Hello World" }
    }).save();

    await form.setUser(user.id);
    const formUser = await form.getUser();

    expect(formUser).toBeDefined();
    expect(formUser.username).toEqual("admin");
    expect(formUser.id).toEqual(user.id);
  });

  it("should allow to query all consent forms from an user instance", async () => {
    const { ConsentForm, User } = db.getModels();
    const user = (await User.findOne({ where: { username: "admin" }}))!;

    let form = await ConsentForm.build({
      data: { text: "Hello World" }
    }).save();
    await form.setUser(user);

    form = await ConsentForm.build({
      data: { text: "Hello Space" }
    }).save();
    await form.setUser(user);

    expect(await user.countConsentForms()).toEqual(2);

    const userForms = await user.getConsentForms();
    expect(userForms.length).toEqual(2);

    expect(userForms[0].data).toEqual({ text: "Hello World" });
    expect(userForms[1].data).toEqual({ text: "Hello Space" });
  });

  it("should allow user IDs in where statements", async () => {
    const { ConsentForm, User } = db.getModels();

    const user = (await User.findOne({ where: { username: "admin" }}))!;
    const form = await ConsentForm.build({
      data: { text: "Hello World" }
    }).save();

    await form.setUser(user.id);

    const savedForm = await ConsentForm.findOne({
      where: {
        data: { text: "Hello World" }
      },
      include: {
        model: User,
        where: { id: user.id }
      }
    });

    expect(savedForm).not.toBeNull();

    const savedUser = savedForm!.user! as UserAttributes;
    expect(savedUser.username).toEqual("admin");
  });

  it("should have automatically generated association methods for the User model", async () => {
    const { ConsentForm } = db.getModels();
    const form = await ConsentForm.create({ data: {} });

    const expectedMethods = generateBelongsToAssociationMethods("User");
    const availableMethods = getAllMethods(form);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
