import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance, UserAttributes } from "./user";

export interface ConsentFormAttributes extends CommonAttributes {
  user: UserAttributes | UserAttributes["id"];
  data?: any;
}

type ConsentFormCreationAttributes = Optional<
  ConsentFormAttributes,
  "id" | "createdAt" | "updatedAt" | "user"
>

/**
 * ConsentForm instance object interface
 */
export interface ConsentFormInstance extends Sequelize.Model<ConsentFormAttributes, ConsentFormCreationAttributes>, ConsentFormAttributes {
  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
  createUser: Sequelize.BelongsToCreateAssociationMixin<UserInstance>;
}

/**
 * Build ConsentForm model object
 *
 * @param sequelize Sequelize: Database connection object
 */
export function ConsentFormModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<ConsentFormInstance> {
  //  DB table name
  const TABLE_NAME = "consent_forms";

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
  const ConsentForm = sequelize.define<ConsentFormInstance, ConsentFormCreationAttributes>("consentForm", attributes, { underscored: true, tableName: TABLE_NAME });
  ConsentForm.beforeCreate(consent => { consent.id = uuidv4(); });

  return ConsentForm;
}
