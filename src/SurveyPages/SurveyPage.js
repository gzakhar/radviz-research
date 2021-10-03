import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

const configuration = [
    {
        imgSrc: './images/radviz.png',
        text: 'Radviz',
        linkTo: '/radviz'
    },
    {
        imgSrc: './images/sradviz.png',
        text: 'S-Radviz',
        linkTo: '/sradviz'
    },
    {
        imgSrc: './images/controls.png',
        text: 'Controls',
        linkTo: '/control'
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
                                style={{ border: 'solid', borderColor: 'blue', height: '22.5%' }}
                            >
                                <Link
                                    to={value['linkTo']}
                                    className='take-survey'
                                >Start {value['text']} Survey</Link>
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