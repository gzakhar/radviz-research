import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

const configuration = [
    {
        imgSrc: './images/radviz.png',
        text: 'Radviz',
        linkTo: '/radviz',
        googleForm: 'https://docs.google.com/forms/d/e/1FAIpQLSdhcmQ7fwtcSZoP0nq21dfkgHFAQUb7nLqvLTsl4lbC-lgTPQ/viewform?usp=sf_link'
    },
    {
        imgSrc: './images/sradviz.png',
        text: 'S-Radviz',
        linkTo: '/sradviz',
        googleForm: 'https://docs.google.com/forms/d/e/1FAIpQLScFvSh9ce5AZUQj5YJBzQlmeQa7nHMfVgcTTCKS258NDGA2Pg/viewform?usp=sf_link'
    },
    {
        imgSrc: './images/controls.png',
        text: 'Controls',
        linkTo: '/sradviz/show',
        googleForm: '/'
    }
]

export default function SurveyPage() {

    const [order, setOrder] = useState(JSON.parse(localStorage.getItem('survey')) || [])

    useEffect(() => {

        if (!localStorage.getItem('survey')) {
            let chooseWithoutReplacement = new ChooseWithoutReplavement(configuration)
            let sessionOrder = chooseWithoutReplacement.randomizeFirstN(2)
            setOrder(sessionOrder)
            localStorage.setItem('survey', JSON.stringify(sessionOrder))
        }

    }, [])

    return (
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
                            style={{ border: 'solid', borderColor: 'green', height: '485.4px', width: '300px', padding: '5px' }}
                        >
                            <div
                                style={{ border: 'solid', borderColor: 'blue', height: '72.5%' }}
                            >
                                <img
                                    style={{ height: '100%', width: '100%' }}
                                    src={value['imgSrc']} />
                            </div>
                            <div
                                style={{ border: 'solid', borderColor: 'blue', height: '10%' }}
                            >
                                <Link
                                    className='take-survey'
                                    to={value['linkTo']}
                                >Start {value['text']}</Link>
                            </div>
                            <div
                                style={{ border: 'solid', borderColor: 'blue', height: '10%' }}
                            >
                                <a
                                    className='take-survey'
                                    href={value['googleForm']}
                                    target="_blank"
                                >Google Form</a>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}


class ChooseWithoutReplavement {
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