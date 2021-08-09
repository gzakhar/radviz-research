import React, { useEffect, useState, useMemo } from 'react';
import RawPositioning from './RawPositioning';
import axios from 'axios';
import Radviz from './Radviz';


let rad2deg = rad => rad * 180 / Math.PI;

function TestingUpdate() {

	
	const [data, setData] = useState([])
	const [countyColorMap, setCountyColorMap] = useState({})

	// let data = [
	// 	{ 'first': 0, 'second': 0, 'third': 0, 'fourth': 0 },
	// 	{ 'first': 1, 'second': 0, 'third': 0, 'fourth': 0 },
	// 	{ 'first': 0, 'second': 1, 'third': 0, 'fourth': 0 },
	// 	{ 'first': 0, 'second': 0, 'third': 1, 'fourth': 0 },
	// 	{ 'first': 0, 'second': 0, 'third': 0, 'fourth': 1 },
	// 	{ 'first': 1, 'second': 1, 'third': 0, 'fourth': 0 },
	// 	{ 'first': 0, 'second': 1, 'third': 1, 'fourth': 0 },
	// 	{ 'first': 0, 'second': 0, 'third': 1, 'fourth': 1 },
	// 	{ 'first': 1, 'second': 0, 'third': 0, 'fourth': 1 },
	// 	{ 'first': 1, 'second': 1, 'third': 1, 'fourth': 0 },
	// 	{ 'first': 0, 'second': 1, 'third': 1, 'fourth': 1 },
	// 	{ 'first': 1, 'second': 0, 'third': 1, 'fourth': 1 },
	// 	{ 'first': 1, 'second': 1, 'third': 0, 'fourth': 1 }
	// ]
	// let labels = {
	// 	'first': 'Right',
	// 	'second': 'Top',
	// 	'third': 'Left',
	// 	'fourth': 'Bottom'
	// }

	// let labelMapping = {
	// 	sepalWidth: 'Sepal Width',
	// 	sepalLength: 'Sepal Length',
	// 	petalLength: 'Petal Length',
	// 	petalWidth: 'Petal Width'
	// };

	// let labelMapping = {
	// 	"2020:Q1": 'q1',
	// 	"2020:Q2": 'q2',
	// 	"2020:Q3": 'q3'
	// }

	let labelMapping = {
		"age_median": 'age',
		"white_ratio": 'nationality',
		"income_per_capita": "income"
	}

	useEffect(() => {
		async function fetchData() {
			let res = await axios('./radviz_demographic_data.json')
			
			let {points, labels} = RawPositioning({ 'content': res.data, 'labels': labelMapping })
			setData({points, labels})

			let countyColorMap = {}
			points.forEach((county) => {
				countyColorMap[county['data']['county_name']] = `hsl(${rad2deg(county.coordinates.angle)}, ${county.coordinates.radius * 100}%, 50%)`
			})
			setCountyColorMap(countyColorMap)
		}

		fetchData()
	}, [])


	return (
		<div className='d-flex'>
			<div style={{ width: '600px' }}>
				{useMemo(() => <Radviz points={data.points} content={data} />, [data])}
			</div>
			<div className='d-flex flex-wrap' style={{ width: '500px' }}>
				{data.points && data.points.map((point, index) =>
					<p key={index}
						style={{
							textAlign: 'center',
							margin: '3px',
							border: 'solid',
							borderWidth: '5px',
							borderColor: `hsl(${rad2deg(point.coordinates.angle)}, ${point.coordinates.radius * 100}%, 50%)`
						}}>
						{point.data['county_name']}
					</p>
				)}
			</div>
		</div>
	);

}

export default TestingUpdate;