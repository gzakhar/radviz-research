import React from 'react';
import Card from '../UI/Card.js';

export default function WelcomePage() {

    console.log(localStorage.getItem('token'))

    return (
        <div className="container">
            <h2>Case Study</h2>
            <div className='d-flex justify-content-around align-items-stretch'>
                <div>
                    <Card title='Radviz' image={'/images/radviz.png'} link='/radviz' />
                </div>
                <div>
                    <Card title='Statistical-Radviz' image={'/images/sradviz.png'} link='/sradviz' />
                </div>
            </div>
            <a href='https://docs.google.com/forms/d/1m1YBLhpdVgs-G7nfjVQFck69n1bUzOxAMgKwQJOd3EM/edit'>survery</a>

            <ol>
                <li>Fix the effectivness google form (alternate between the original and the statistical)</li>
                <li>Get professors feedback from professor about the questions.</li>
                <li>Fix the effectivness case study website (find correct controls and delete the controls)</li>
                <li>Create SUS (system usablilty) webiste portions (just the statistical-radviz)</li>
                <li>Write up a google form for the SUS (https://www.usability.gov/how-to-and-tools/methods/system-usability-scale.html).</li>
            </ol>
        </div>
    )
}