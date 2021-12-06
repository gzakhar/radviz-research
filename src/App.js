import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ProtectedRoute from './LogIn/ProtectedRoute.js';
import RadvizDemographic from './SurveyPages/RadvizDemographic.js';
import SRadvizDemographic from './SurveyPages/SRadvizDemographic.js';
import Login from './LogIn/Login.js';
import HomePage from './SurveyInfra/HomePage.js';
import SurveyPage from './SurveyInfra/SurveyPage.js';
import DemoPage from './SurveyPages/DemoPage.js'
import DefinitionPage from './SurveyInfra/DefinitionPage.js';

export default function App() {

    return (
        <Router>
            <Switch>
                <Route exact path='/' component={HomePage} />
                <ProtectedRoute path='/survey' component={SurveyPage} />
                <Route path='/demo' component={DemoPage} />
                <Route path='/radviz/' component={RadvizDemographic} />
                <Route path='/sradviz/' component={SRadvizDemographic} />
                <Route path='/login' component={Login} />
                <Route path='/definitions' component={DefinitionPage} />
            </Switch>
        </Router>
    )
}