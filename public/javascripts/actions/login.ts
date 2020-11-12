import { ActionCreatorsMapObject } from "redux";
import { AsyncAction, BasicAction, PayloadAction } from "../util";

import i18n from "../i18n";

export type SET_LOGGED_IN_USER = PayloadAction<"SET_LOGGED_IN_USER", { id: string, username: string, image: string }>;
function setLoggedInUser(id: string, username: string, image: string): SET_LOGGED_IN_USER {
  return {
    type: "SET_LOGGED_IN_USER",
    payload: {
      id, username, image
    }
  };
}

export type SET_LOGIN_ERROR = BasicAction<"SET_LOGIN_ERROR">;
function setLoginError(): SET_LOGIN_ERROR {
  return {
    type: "SET_LOGIN_ERROR"
  };
}

export type CLEAR_LOGGED_IN_USER = BasicAction<"CLEAR_LOGGED_IN_USER">;
function clearLoggedInUser(): CLEAR_LOGGED_IN_USER {
  return {
    type: "CLEAR_LOGGED_IN_USER"
  };
}

export function performLogin(username: string, password: string): AsyncAction<void, SET_LOGGED_IN_USER | SET_LOGIN_ERROR> {
  return async (dispatch) => {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const { user } = await response.json();

      dispatch(setLoggedInUser(
        user.id,
        user.username,
        user.image
      ));

      if (user.preferredLanguage) {
        i18n.changeLanguage(user.preferredLanguage);
      }
    } else {
      dispatch(setLoginError());
    }
  };
}

export function performLogout(): AsyncAction<void, CLEAR_LOGGED_IN_USER> {
  return async (dispatch) => {
    const response = await fetch("/logout", { method: "POST" });

    if (response.ok) {
      dispatch(clearLoggedInUser());
    }
  };
}

export interface LoginActions extends ActionCreatorsMapObject {
  setLoggedInUser: (id: string, username: string, image: string) => SET_LOGGED_IN_USER;
  setLoginError: () => SET_LOGIN_ERROR;
  clearLoggedInUser: () => CLEAR_LOGGED_IN_USER;
  performLogin: (username: string, password: string, success?: () => void) => AsyncAction<void, SET_LOGGED_IN_USER>;
  performLogout: () => AsyncAction<void, CLEAR_LOGGED_IN_USER>;
}

export const actionCreators: LoginActions = {
  setLoggedInUser,
  setLoginError,
  clearLoggedInUser,
  performLogin,
  performLogout
};
