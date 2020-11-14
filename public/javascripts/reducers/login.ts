import { ActionHandler } from "../action_handler";
import * as actions from "../actions/login";

export interface LoginState {
  loggedIn: boolean;
  loginError: boolean;
  registrationError: string | null;
  user?: { id: string, username: string, image?: string };
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

export default actionHandler.getReducer();
