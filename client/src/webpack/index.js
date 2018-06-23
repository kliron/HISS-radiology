import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '../modules/App';
require('./app.css');
require('./index.html');

ReactDOM.render(<App />, document.getElementById('root'));
