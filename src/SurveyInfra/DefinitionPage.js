import React from 'react';
import { GRAPH_DESCRIPTION } from '../StatePositions';

export default function DefinitionPage() {


    return (

        <div className='d-flex align-items-center' style={{ height: '100%' }} >
            <div className='d-flex justify-content-lg-around align-items-lg-center' style={{ height: '100%', width: '50%' }} >
                <div className='d-flex flex-column justify-content-lg-between' style={{ height: '800px', width: '500px', padding: '5px' }} >
                    <div style={{ height: '72.5%' }} >
                        <img src='./images/radviz.png' className='generic-image' style={{ height: '100%', width: '100%' }} />
                    </div>
                    <div style={{ marginTop: '10px', backgroundColor: 'white', borderRadius: '10px', padding: '5px' }} >
                        {GRAPH_DESCRIPTION[0]}
                    </div>
                </div>
            </div>
            <div style={{ border: 'solid', borderWidth: '1px', height: '75%' }} />
            <div className='d-flex justify-content-lg-around align-items-lg-center' style={{ height: '100%', width: '50%' }}>
                <div className='d-flex flex-column justify-content-lg-between' style={{ height: '800px', width: '500px', padding: '5px' }}>
                    <div style={{ height: '72.5%' }}>
                        <img src='./images/sradviz.png' className='generic-image' style={{ height: '100%', width: '100%' }} />
                    </div>
                    <div style={{ marginTop: '10px', backgroundColor: 'white', borderRadius: '10px', padding: '5px' }} >
                        {GRAPH_DESCRIPTION[1]}
                    </div>
                </div>
            </div>
        </div>
    )
}