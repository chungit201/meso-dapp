import { createAction } from '@reduxjs/toolkit';

const SET_SHOW_CONNECT = createAction<boolean>('app/SET_SHOW_CONNECT');
const SET_THEME = createAction<string>('app/SET_THEME');
const SET_IS_LOGIN = createAction<boolean>('app/SET_IS_LOGIN');
const SET_MANAGE_ASSETS = createAction<boolean>('app/SET_MANAGE_ASSETS');
const SET_EMODE_CALCULATOR = createAction<string>('app/SET_EMODE_CALCULATOR');
const SET_STEP_CALCULATOR = createAction<number>('app/SET_STEP_CALCULATOR');

export default {
  SET_SHOW_CONNECT,
  SET_THEME,
  SET_IS_LOGIN,
  SET_MANAGE_ASSETS,
  SET_EMODE_CALCULATOR,
  SET_STEP_CALCULATOR,
};
