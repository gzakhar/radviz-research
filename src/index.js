import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.js';
import axios from 'axios';

axios.defaults.baseURL = '/';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);