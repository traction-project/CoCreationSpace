import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance } from "./user";

export interface QuestionnaireAttributes extends CommonAttributes {
  name: string;
  data: any;
}


type QuestionnaireCreationAttributes = Optional<QuestionnaireAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Questionnaire instance object interface
 */
export interface QuestionnaireInstance extends Sequelize.Model<QuestionnaireAttributes, QuestionnaireCreationAttributes>, QuestionnaireAttributes {
  getUsers: Sequelize.BelongsToManyGetAssociationsMixin<UserInstance>;
  setUsers: Sequelize.BelongsToManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addUsers: Sequelize.BelongsToManyAddAssociationsMixin<UserInstance, UserInstance["id"]>;
  addUser: Sequelize.BelongsToManyAddAssociationMixin<UserInstance, UserInstance["id"]>;
  removeUser: Sequelize.BelongsToManyRemoveAssociationMixin<UserInstance, UserInstance["id"]>;
  removeUsers: Sequelize.BelongsToManyRemoveAssociationsMixin<UserInstance, UserInstance["id"]>;
  hasUser: Sequelize.BelongsToManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasUsers: Sequelize.BelongsToManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  countUsers: Sequelize.BelongsToManyCountAssociationsMixin;
}

/**
 * Build Questionnaire Model object
 * @param sequelize Sequelize: Connection object
 */
export function QuestionnaireModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<QuestionnaireInstance> {
  //  DB table name
  const TABLE_NAME = "questionnaires";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
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
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false
    }
  };

  // Create the model
  const Questionnaire = sequelize.define<QuestionnaireInstance, QuestionnaireCreationAttributes>("questionnaire", attributes, { underscored: true, tableName: TABLE_NAME });
  Questionnaire.beforeCreate(questionnaire => { questionnaire.id = uuidv4(); });

  return Questionnaire;
}
