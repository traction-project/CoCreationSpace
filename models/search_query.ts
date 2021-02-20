import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance, UsersAttributes } from "./users";

export interface SearchQueryAttributes extends CommonAttributes {
  user: UsersAttributes | UsersAttributes["id"];
  query: string;
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
 * @param sequelize Sequelize: Conection object with de database
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
  const SearchQuery = sequelize.define<SearchQueryInstance, SearchQueryCreationAttributes>("searchQuery", attributes, { underscored: true, tableName: TABLE_NAME });
  SearchQuery.beforeCreate(group => { group.id = uuidv4(); });

  return SearchQuery;
}