import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UsersAttributes } from "./users";
import { MultimediaAttributes } from "./multimedia";

export interface MultimediaInteractionAttributes extends CommonAttributes {
  multimedia: MultimediaAttributes | MultimediaAttributes["id"];
  user: UsersAttributes | UsersAttributes["id"];
  interaction: { type: string, timestamp: number };
}

type MultimediaInteractionCreationAttributes = Optional<
  MultimediaInteractionAttributes,
  "id" | "createdAt" | "updatedAt" | "multimedia" | "user"
>

/**
 * MultimediaInteraction instance object interface
 */
export interface MultimediaInteractionInstance extends Sequelize.Model<MultimediaInteractionAttributes, MultimediaInteractionCreationAttributes>, MultimediaInteractionAttributes {
}

/**
 * Build MultimediaInteraction model object
 *
 * @param sequelize Sequelize: Conection object with de database
 */
export function MultimediaInteractionModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<MultimediaInteractionInstance> {
  //  DB table name
  const TABLE_NAME = "multimedia_interactions";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    multimedia_id: {
      type: Sequelize.DataTypes.UUID
    },
    user_id: {
      type: Sequelize.DataTypes.UUID
    },
    interaction: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false
    },
    created_at: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    updated_at: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    }
  };

  // Create the model
  const MultimediaInteraction = sequelize.define<MultimediaInteractionInstance, MultimediaInteractionCreationAttributes>("multimediaInteraction", attributes, { underscored: true, tableName: TABLE_NAME });
  MultimediaInteraction.beforeCreate(group => { group.id = uuidv4(); });

  return MultimediaInteraction;
}
