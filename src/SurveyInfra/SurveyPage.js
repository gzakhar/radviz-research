import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const configuration = [
    {
        imgSrc: './images/radviz.png',
        text: 'Radviz',
        linkTo: '/radviz?showAnchorControls=False&showSTDControls=False&stateId=2&description=0&directions=0',
        googleForm: 'https://docs.google.com/forms/d/e/1FAIpQLSdhcmQ7fwtcSZoP0nq21dfkgHFAQUb7nLqvLTsl4lbC-lgTPQ/viewform?usp=sf_link'
    },
    {
        imgSrc: './images/sradviz.png',
        text: 'S-Radviz',
        linkTo: '/sradviz?showAnchorControls=False&showSTDControls=False&stateId=0&description=1&directions=1',
        googleForm: 'https://docs.google.com/forms/d/e/1FAIpQLScFvSh9ce5AZUQj5YJBzQlmeQa7nHMfVgcTTCKS258NDGA2Pg/viewform?usp=sf_link'
    },
    {
        imgSrc: './images/controls.png',
        text: 'Controls',
        linkTo: '/sradviz?showAnchorControls=False&showSTDControls=True&stateId=0&description=1&directions=2',
        googleForm: 'https://docs.google.com/forms/d/e/1FAIpQLScQ1kmRsEQ8ll8nbI6mOUUZsdk3etAuULHcVtLf6dvMeQEEVw/viewform?usp=sf_link'
    }
]

export default function SurveyPage() {

    const [order, setOrder] = useState(JSON.parse(localStorage.getItem('surveyOrder')) || [])

    useEffect(() => {
        if (!localStorage.getItem('surveyOrder')) {
            let chooseWithoutReplacement = new ChooseWithoutReplacement([0, 1, 2])
            let sessionOrder = chooseWithoutReplacement.randomizeFirstN(2)
            setOrder(sessionOrder)
            localStorage.setItem('surveyOrder', JSON.stringify(sessionOrder))
        }

    }, [])

    return (
        <div style={{ height: '100%' }}>
            <div style={{padding: '10px'}}>
                <Link className="btn btn-secondary" to='/'>Home</Link>
            </div>
            <div
                className='d-flex justify-content-around align-items-center'
                style={{ height: '100%' }}
            >
                {
                    order.map((value, index) => (
                        <div
                            key={index}
                            className='d-flex flex-column align-items-center justify-content-between'
                            style={{ height: '550px' }}
                        >

                            <div
                                style={{ display: 'inline-block' }}>
                                <span className='dot'>
                                    {index + 1}
                                </span>
                                {(index < order.length - 1) && <span className='line' />}
                            </div>

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
                                        className='generic-image'
                                        style={{ height: '100%', width: '100%' }}
                                        src={configuration[value]['imgSrc']} />
                                </div>
                                <div
                                    style={{
                                        // border: 'solid', 
                                        // borderColor: 'blue', 
                                        height: '22.5%'
                                    }}
                                >
                                    <Link
                                        className='generic-button'
                                        to={configuration[value]['linkTo'] + '&form=' + configuration[value]['googleForm']}
                                    >Start {configuration[value]['text']}</Link>
                                </div>
                            </div>
                        </div>
                    ))
                }

            </div>
        </div>
    )
}


class ChooseWithoutReplacement {
    constructor(list) {
        this.list = list;
        this.lenth = list.lenth;
    }

    getItem() {

        let retval = this.list.splice(parseInt(this.lenth * Math.random()), 1)
        this.lenth = this.list.lenth
        return retval
    }

    randomizeFirstN(n) {

        let ret = []
        let temp = [...this.list]

        for (let leftToRandomize = n; leftToRandomize > 0; leftToRandomize--) {
            ret.push(...temp.splice(parseInt(leftToRandomize * Math.random()), 1))
        }

        return ret.concat(temp)
    }
}