import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";

import createRootReducer from "./reducers/index";
import { LoginState } from "./reducers/login";

// Combined application state
export interface ApplicationState {
  login: LoginState
}

// This line is needed so the application works with Redux dev tools
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Initialise application store with root reducer and insert routing and thunk middlewares
const store = createStore(
  createRootReducer(),
  undefined,
  composeEnhancers(applyMiddleware(thunk))
);

export default store;
