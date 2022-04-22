import Sequelize from "sequelize";

export interface UserQuestionnaireAttributes {
  results: any;
}

/**
 * UserQuestionnaire instance object interface
 */
export interface UserQuestionnaireInstance extends Sequelize.Model<UserQuestionnaireAttributes>, UserQuestionnaireAttributes {
}

/**
 * Build UserQuestionnaire model object
 *
 * @param sequelize Sequelize: Database connection object
 */
export function UserQuestionnaireModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<UserQuestionnaireInstance> {
  //  DB table name
  const TABLE_NAME = "user_questionnaires";

  // Model attributtes
  const attributes = {
    results: {
      type: Sequelize.DataTypes.JSON,
      allowNull: true
    }
  };

  // Create the model
  const UserQuestionnaire = sequelize.define<UserQuestionnaireInstance>("userQuestionnaire", attributes, { underscored: true, tableName: TABLE_NAME });

  return UserQuestionnaire;
}
