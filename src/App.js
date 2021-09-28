import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ProtectedRoute from './ProtectedRoute.js';
import RadvizDemographic from './RadvizDemographic.js';
import SRadvizDemographic from './SRadvizDemographic.js';
import Login from './Login.js';
import WelcomePage from './WelcomePage.js';
import HomePage from './SurveyPages/HomePage.js';
import SurveyPage from './SurveyPages/SurveyPage.js';


export default function App() {

    return (
        <Router>
            <Switch>
                <Route exact path='/' component={HomePage}/>
                <Route path='/survey' component={SurveyPage}/>
                <Route exact path='/welcome' component={WelcomePage} />
                <Route path='/radviz' component={RadvizDemographic} />
                <ProtectedRoute path='/sradviz' component={SRadvizDemographic} />
                <Route path='/login' component={Login}/>
            </Switch>
        </Router>
    )
}