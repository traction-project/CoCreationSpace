import { Optional } from "sequelize";

/**
 * Common attributes of all models of database
 */
export type commonAttributes = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
