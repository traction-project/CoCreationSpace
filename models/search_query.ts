import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance, UserAttributes } from "./user";

export interface SearchQueryAttributes extends CommonAttributes {
  user: UserAttributes | UserAttributes["id"];
  query: string;
  resultcount?: number;
}

type SearchQueryCreationAttributes = Optional<
  SearchQueryAttributes,
  "id" | "createdAt" | "updatedAt" | "user"
>

/**
 * SearchQuery instance object interface
 */
export interface SearchQueryInstance extends Sequelize.Model<SearchQueryAttributes, SearchQueryCreationAttributes>, SearchQueryAttributes {
  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
  createUser: Sequelize.BelongsToCreateAssociationMixin<UserInstance>;
}

/**
 * Build SearchQuery model object
 *
 * @param sequelize Sequelize: Database connection object
 */
export function SearchQueryModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<SearchQueryInstance> {
  //  DB table name
  const TABLE_NAME = "search_queries";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    query: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    resultcount: {
      type: Sequelize.DataTypes.INTEGER
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
  const SearchQuery = sequelize.define<SearchQueryInstance, SearchQueryCreationAttributes>("searchQuery", attributes, { underscored: true, tableName: TABLE_NAME });
  SearchQuery.beforeCreate(group => { group.id = uuidv4(); });

  return SearchQuery;
}
