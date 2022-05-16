import { configureStore, createReducer, createAction } from '@reduxjs/toolkit';

const initialState = {
  page: null,
  cards: null,
  username: ''
}

export const actionSetPage = createAction('setPage');
export const actionSetCards = createAction('setCards');
export const actionSetUsername = createAction('setUsername');

const reducer = createReducer(initialState,
  (builder) => {
    builder
      .addCase(actionSetPage, (state, action) => {
        state.page = action.payload
      })
      .addCase(actionSetCards, (state, action) => {
        console.log('cards action', action)
        state.cards = action.payload
      })
      .addCase(actionSetUsername, (state, action) => {
        state.username = action.payload
      })
      .addDefaultCase((state, action) => {})
  }
);

export const store = configureStore({reducer});
