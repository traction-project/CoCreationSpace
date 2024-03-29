import { ActionHandler } from "../action_handler";
import * as actions from "../actions/login";

export interface LoginState {
  loggedIn: boolean;
  loginError: boolean;
  registrationError: string | null;
  user?: { id: string, username: string, admin: boolean, theme: string, image?: string, email?: string };
}

export const initialState: LoginState = {
  loggedIn: false,
  loginError: false,
  registrationError: null
};

const actionHandler = new ActionHandler<LoginState>(initialState);

actionHandler.addHandler("SET_LOGGED_IN_USER", (state, action: actions.SET_LOGGED_IN_USER) => {
  const { payload } = action;

  return {
    loggedIn: true,
    loginError: false,
    registrationError: null,
    user: payload
  };
});

actionHandler.addHandler("CLEAR_LOGGED_IN_USER", (state, action) => {
  return {
    loggedIn: false,
    loginError: false,
    registrationError: null,
  };
});

actionHandler.addHandler("SET_LOGIN_ERROR", (state, action: actions.SET_LOGIN_ERROR) => {
  return {
    ...state,
    loginError: true
  };
});

actionHandler.addHandler("SET_REGISTRATION_ERROR", (state, action: actions.SET_REGISTRATION_ERROR) => {
  const { payload } = action;

  return {
    ...state,
    registrationError: payload.message
  };
});

actionHandler.addHandler("SET_THEME", (state, action: actions.SET_THEME) => {
  const { payload } = action;

  if (state.user) {
    return {
      ...state,
      user: {
        ...state.user,
        theme: payload.theme
      }
    };
  }

  return state;
});

export default actionHandler.getReducer();
