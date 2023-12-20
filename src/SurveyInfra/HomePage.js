import React from 'react';
import { Link } from 'react-router-dom'

export default function HomePage() {

    return (

        <div
            className='d-flex align-items-center'
            style={{ height: '100%' }}
        >

            <div
                className='d-flex justify-content-lg-around align-items-lg-center'
                style={{
                    // border: 'solid',
                    // borderColor: 'red',
                    height: '100%', width: '50%'
                }}
            >
                <div
                    className='d-flex flex-column justify-content-lg-between'
                    style={{
                        // border: 'solid',
                        // borderColor: 'green',
                        height: '485.4px', width: '300px', padding: '5px'
                    }}
                >
                    <div
                        style={{
                            // border: 'solid',
                            // borderColor: 'blue',
                            height: '72.5%'
                        }}
                    >
                        <img
                            src='./images/radviz.png'
                            className='generic-image'
                            style={{ height: '100%', width: '100%' }} />
                    </div>
                    <div
                        style={{
                            // border: 'solid',
                            // borderColor: 'blue',
                            height: '22.5%'
                        }}
                    >
                        <Link
                            to='demo'
                            className='generic-button'
                        >
                           Demo
                        </Link>
                    </div>
                </div>
            </div>
            <div
                style={{
                    border: 'solid',
                    // borderColor: 'black',
                    borderWidth: '1px', height: '75%'
                }}
            />
            <div
                className='d-flex justify-content-lg-around align-items-lg-center'
                style={{
                    // border: 'solid',
                    // borderColor: 'red',
                    height: '100%', width: '50%'
                }}
            >
                <div
                    className='d-flex flex-column justify-content-lg-between'
                    style={{
                        // border: 'solid',
                        // borderColor: 'green',
                        height: '485.4px', width: '300px', padding: '5px'
                    }}
                >
                    <div
                        style={{
                            // border: 'solid',
                            // borderColor: 'blue',
                            height: '72.5%'
                        }}
                    >
                        <img
                            src='./images/SurveyPicture.png'
                            className='generic-image'
                            style={{ height: '100%', width: '100%' }} />
                    </div>
                    <div
                        style={{
                            // border: 'solid',
                            // borderColor: 'blue',
                            height: '22.5%'
                        }}
                    >
                        <Link
                            to='/survey'
                            className='generic-button'
                        >
                            Take Survey
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )

}