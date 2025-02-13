import { combineReducers } from '@reduxjs/toolkit';
import app from './app';

const rootReducer = combineReducers({
  app: app.reducer,
});
export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;

export const initRootState = {
  app: app.initState,
};
