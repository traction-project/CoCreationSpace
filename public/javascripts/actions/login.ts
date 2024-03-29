import { ActionCreatorsMapObject } from "redux";
import { AsyncAction, BasicAction, PayloadAction } from "../util";

import i18n from "../i18n";

export type SET_LOGGED_IN_USER = PayloadAction<"SET_LOGGED_IN_USER", { id: string, username: string, image: string, admin: boolean, theme: string, email?: string }>;
function setLoggedInUser(id: string, username: string, image: string, admin: boolean, theme: string, email?: string): SET_LOGGED_IN_USER {
  return {
    type: "SET_LOGGED_IN_USER",
    payload: {
      id, username, image, admin, email, theme
    }
  };
}

export type SET_LOGIN_ERROR = BasicAction<"SET_LOGIN_ERROR">;
function setLoginError(): SET_LOGIN_ERROR {
  return {
    type: "SET_LOGIN_ERROR"
  };
}

export type SET_REGISTRATION_ERROR = PayloadAction<"SET_REGISTRATION_ERROR", { message: string }>;
function setRegistrationError(message: string): SET_REGISTRATION_ERROR {
  return {
    type: "SET_REGISTRATION_ERROR",
    payload: {
      message
    }
  };
}

export type CLEAR_LOGGED_IN_USER = BasicAction<"CLEAR_LOGGED_IN_USER">;
function clearLoggedInUser(): CLEAR_LOGGED_IN_USER {
  return {
    type: "CLEAR_LOGGED_IN_USER"
  };
}

export type SET_THEME = PayloadAction<"SET_THEME", { theme: string}>;
function setTheme(theme: string): SET_THEME {
  return {
    type: "SET_THEME",
    payload: {
      theme
    }
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
        user.image,
        user.admin,
        user.theme,
        user.email
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

export function performThemeChange(theme: string): AsyncAction<void, SET_THEME> {
  return async (dispatch) => {
    const response = await fetch("/users/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme })
    });

    if (response.ok) {
      dispatch(setTheme(theme));
    }
  };
}

export interface LoginActions extends ActionCreatorsMapObject {
  setLoggedInUser: (id: string, username: string, image: string, admin: boolean, theme: string, email?: string) => SET_LOGGED_IN_USER;
  setLoginError: () => SET_LOGIN_ERROR;
  setRegistrationError: (message: string) => SET_REGISTRATION_ERROR;
  setTheme: (theme: string) => SET_THEME;
  clearLoggedInUser: () => CLEAR_LOGGED_IN_USER;
  performLogin: (username: string, password: string) => AsyncAction<void, SET_LOGGED_IN_USER>;
  performLogout: () => AsyncAction<void, CLEAR_LOGGED_IN_USER>;
  performThemeChange: (theme: string) => AsyncAction<void, SET_THEME>;
}

export const actionCreators: LoginActions = {
  setLoggedInUser,
  setLoginError,
  setRegistrationError,
  setTheme,
  clearLoggedInUser,
  performLogin,
  performLogout,
  performThemeChange
};
