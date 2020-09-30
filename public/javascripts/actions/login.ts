import { ActionCreatorsMapObject } from "redux";
import { BasicAction, PayloadAction } from "../util";

export type SET_LOGGED_IN_USER = PayloadAction<"SET_LOGGED_IN_USER", { id: string, username: string, image: string }>;
function setLoggedInUser(id: string, username: string, image: string): SET_LOGGED_IN_USER {
  return {
    type: "SET_LOGGED_IN_USER",
    payload: {
      id, username, image
    }
  };
}

export type CLEAR_LOGGED_IN_USER = BasicAction<"CLEAR_LOGGED_IN_USER">;
function clearLoggedInUser(): CLEAR_LOGGED_IN_USER {
  return {
    type: "CLEAR_LOGGED_IN_USER"
  };
}

export interface LoginActions extends ActionCreatorsMapObject {
  setLoggedInUser: (id: string, username: string, image: string) => SET_LOGGED_IN_USER;
  clearLoggedInUser: () => CLEAR_LOGGED_IN_USER;
}

export const actionCreators: LoginActions = {
  setLoggedInUser,
  clearLoggedInUser
};
