import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance, UserAttributes } from "./user";

export interface NotificationAttributes extends CommonAttributes {
  data: any;
  seen?: boolean;
  user?: UserAttributes | UserAttributes["id"];
  hash?: string;
}

type NotificationCreationAttributes = Optional<NotificationAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Users instance object interface
 */
export interface NotificationInstance extends Sequelize.Model<NotificationAttributes, NotificationCreationAttributes>, NotificationAttributes {
  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
}

/**
 *  Build Users Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function NotificationModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<NotificationInstance> {
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    data: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false
    },
    seen: {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    userId : {
      type: Sequelize.DataTypes.UUID,
    },
    hash: {
      type: Sequelize.DataTypes.STRING
    }
  };

  // Create the model
  const Notification = sequelize.define<NotificationInstance, NotificationCreationAttributes>("notification", attributes, { underscored: true, tableName: "notifications", paranoid: true });

  Notification.beforeCreate(notification => { notification.id = uuidv4(); });

  return Notification;
}
