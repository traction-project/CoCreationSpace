import { DataContainerAttributes } from "models/data_container";
import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";
import association from "../../models/associations";

describe("Posts model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);

    const { Users } = db.getModels();
    await Users.create({
      username: "admin"
    });
  });

  beforeEach(async () => {
    const { Posts } = db.getModels();
    await Posts.destroy({ truncate: true });
  });

  it("should create a post with associated data container", async () => {
    const { Users, Posts, DataContainer } = db.getModels();

    const post = Posts.build({
      user_id: (await Users.findOne({}))!.id,
      dataContainer: DataContainer.build({
        text_content: "This is a comment"
      }),
      second: 0
    }, {
      include: [ association.getAssociatons().postAssociations.PostDataContainer ]
    });

    await post.save();
    const { dataContainer } = post;

    expect(dataContainer).toBeDefined();
    expect((dataContainer as DataContainerAttributes).text_content).toEqual("This is a comment");

    expect(await DataContainer.count()).toEqual(1);
  });
});
