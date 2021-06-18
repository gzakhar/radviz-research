import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import RadvizGraph from './RadvizGraph';
import RadvixBorderTestGraph from './RadvixBorderTestGraph';
import TestingUpdate from './TestingUpdate';
// import App from './AppMapBox';
import App from './App';
import TestingDataWithStatisticalDynamicRadviz from './TestingDataWithStatisticalDynamicRadviz';
import TestingDataWithDynamicRadviz from './TestingDataWithDynamicRadviz';

ReactDOM.render(
  <React.StrictMode>
    {/* <RadvizGraph /> */}
    {/* <RadvixBorderTestGraph /> */}
    {/* <TestingUpdate/> */}
    {/* <App /> */}
    <TestingDataWithStatisticalDynamicRadviz />
    {/* <TestingDataWithDynamicRadviz /> */}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
