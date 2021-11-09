import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance, UserAttributes } from "./user";

export interface InternalNavigationStepAttributes extends CommonAttributes {
  user: UserAttributes | UserAttributes["id"];
  data?: any;
  userAgent?: string;
}

type InternalNavigationStepCreationAttributes = Optional<
  InternalNavigationStepAttributes,
  "id" | "createdAt" | "updatedAt" | "user"
>

/**
 * InternalNavigationStep instance object interface
 */
export interface InternalNavigationStepInstance extends Sequelize.Model<InternalNavigationStepAttributes, InternalNavigationStepCreationAttributes>, InternalNavigationStepAttributes {
  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
  createUser: Sequelize.BelongsToCreateAssociationMixin<UserInstance>;
}

/**
 * Build InternalNavigationStep model object
 *
 * @param sequelize Sequelize: Conection object with de database
 */
export function InternalNavigationStepModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<InternalNavigationStepInstance> {
  //  DB table name
  const TABLE_NAME = "internal_navigation_steps";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    data: {
      type: Sequelize.DataTypes.JSON
    },
    userAgent: {
      type: Sequelize.DataTypes.STRING
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
    }
  };

  // Create the model
  const InternalNavigationStep = sequelize.define<InternalNavigationStepInstance, InternalNavigationStepCreationAttributes>("internalNavigationStep", attributes, { underscored: true, tableName: TABLE_NAME });
  InternalNavigationStep.beforeCreate(group => { group.id = uuidv4(); });

  return InternalNavigationStep;
}
