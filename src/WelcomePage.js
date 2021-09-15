import React from 'react';
import Card from './Card.js';
import Content from './Content.js';

export default function WelcomePage() {

    console.log(localStorage.getItem('token'))

    return (
        <>
            <Content>
                <div className='d-flex justify-content-around align-items-stretch'>

                    <div>
                        <Card title='Radviz' image={'/images/radviz.png'} link='/radviz' />
                    </div>
                    <div>
                        <Card title='Statistical-Radviz' image={'/images/sradviz.png'} link='/sradviz' />
                    </div>
                </div>
            </Content>
        </>
    )
}