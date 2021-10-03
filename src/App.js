import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ProtectedRoute from './LogIn/ProtectedRoute.js';
import RadvizDemographic from './SurveyPages/RadvizDemographic.js';
import SRadvizDemographic from './SurveyPages/SRadvizDemographic.js';
import Login from './LogIn/Login.js';
import WelcomePage from './SurveyInfra/WelcomePage.js';
import HomePage from './SurveyInfra/HomePage.js';
import SurveyPage from './SurveyInfra/SurveyPage.js';


export default function App() {

    return (
        <Router>
            <Switch>
                <Route exact path='/' component={HomePage}/>
                <ProtectedRoute path='/survey' component={SurveyPage}/>
                <Route exact path='/welcome' component={WelcomePage} />
                <Route path='/radviz' component={RadvizDemographic} />
                <Route path='/sradviz/:showControls?' component={SRadvizDemographic} />
                <Route path='/login' component={Login}/>
            </Switch>
        </Router>
    )
}