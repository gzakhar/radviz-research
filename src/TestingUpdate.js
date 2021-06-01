import React, { useEffect, useState, useMemo } from 'react';
import { RawPositioning } from './RawPositioning';
import axios from 'axios';
import Radviz from './Radviz';

let rad2deg = rad => rad * 180 / Math.PI;

function TestingUpdate() {

	const [data, setData] = useState([])

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

	let labelMapping = {
		sepalWidth: 'Sepal Width',
		sepalLength: 'Sepal Length',
		petalLength: 'Petal Length',
		petalWidth: 'Petal Width'
	};

	useEffect(() => {
		async function fetchData() {
			let res = await axios('./iris.json')
			setData(RawPositioning({ 'content': res.data, 'labels': labelMapping }))
		}

		fetchData()
	}, [])

	console.log(data.points)

	return (
		<div className='d-flex'>
			<div style={{ width: '600px' }}>
				{useMemo(() => <Radviz points={data.points} content={data} />, [data])}
			</div>
			<div className='d-flex flex-wrap' style={{ width: '500px' }}>
				{data.points && data.points.map((point, index) =>
					<p style={{ 
						textAlign: 'center',
						margin: '3px',
						width: '50px',
						border: 'solid', 
						borderWidth: '5px',
						borderColor: `hsl(${rad2deg(point.coordinates.angle)}, ${point.coordinates.radius * 100}%, 50%)` }}>
						{index}
					</p>
				)}
			</div>
		</div>
	);

}

export default TestingUpdate;