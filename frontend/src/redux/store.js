import { rootReducer } from "./rootSlice";
import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";

const reducer = combineReducers({
  root: rootReducer,
});

const store = configureStore({
  reducer,
});

export default store;
