import React from 'react';
import * as ReactDOM from 'react-dom/client';

import { store } from './store'
import { Provider } from 'react-redux'

import { App } from './components/App';

import './index.css';

import './lib/messageSystem.js';
import './lib/messageSystem.scss';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <App />
  </Provider>
)