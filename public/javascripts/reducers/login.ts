import { ActionHandler } from "../action_handler";
import * as actions from "../actions/login";

export interface LoginState {
  loggedIn: boolean;
  user?: { id: string, username: string, image?: string };
}

export const initialState: LoginState = {
  loggedIn: false
};

const actionHandler = new ActionHandler<LoginState>(initialState);

actionHandler.addHandler("SET_LOGGED_IN_USER", (state, action: actions.SET_LOGGED_IN_USER) => {
  const { payload } = action;

  return {
    loggedIn: true,
    user: payload
  };
});

actionHandler.addHandler("CLEAR_LOGGED_IN_USER", (state, action) => {
  return {
    loggedIn: false
  };
});

export default actionHandler.getReducer();
