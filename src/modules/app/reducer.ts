import { getData } from '@/common/hooks/useLocalStoragre'
import { createReducer } from '@reduxjs/toolkit'
import actions from './actions'

interface appState {
  theme: string
  showConnect: boolean
  showModalManageAssets: boolean
  isLogin: boolean
  emodeCalculator: string
  stepCalculator: number
}

const theme = getData('theme') ?? 'dark'
const mode = getData('emodeCalculator') ?? ''

export const initState: appState = {
  theme,
  showConnect: false,
  showModalManageAssets: false,
  isLogin: false,
  emodeCalculator: mode,
  stepCalculator: 0,
}

export default createReducer(initState, (builder) => {
  builder.addCase(actions.SET_THEME, (state, { payload }) => {
    state.theme = payload
  })
  builder.addCase(actions.SET_SHOW_CONNECT, (state, { payload }) => {
    state.showConnect = payload
  })
  builder.addCase(actions.SET_MANAGE_ASSETS, (state, { payload }) => {
    state.showModalManageAssets = payload
  })
  builder.addCase(actions.SET_IS_LOGIN, (state, { payload }) => {
    state.isLogin = payload
  })
  builder.addCase(actions.SET_EMODE_CALCULATOR, (state, { payload }) => {
    state.emodeCalculator = payload
  })
  builder.addCase(actions.SET_STEP_CALCULATOR, (state, { payload }) => {
    state.stepCalculator = payload
  })
})
