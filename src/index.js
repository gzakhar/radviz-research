import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AppSTD from './AppSTD.js';

ReactDOM.render(
  <React.StrictMode>
    <AppSTD />
    {/* <div>
      <svg width="1000" height="1000" viewBox='-500 -500 1000 1000'>
        <circle cx="0" cy="0" r="215" fill='red' />
        <path d="M -171.707 129.39 A 215 215 0 1 1 206.671 59.262 L 0 0 Z"/>
      </svg>
    </div> */}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
