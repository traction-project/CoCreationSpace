import { combineReducers } from "redux";

import login from "./login";

// Combine all reducers into a single reducer and return a function which takes
// a history object as argument
const createRootReducer = () => {
  return combineReducers({
    login
  });
};

export default createRootReducer;
