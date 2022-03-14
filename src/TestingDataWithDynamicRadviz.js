import React, { useEffect, useState, useMemo } from 'react';
import RawPositioning from './RawPositioningDynamicLabels';
import Radviz from './Radviz';
import axios from 'axios'


export default function TestingDataWithDynamicRadviz() {

	const [rawData, setRawData] = useState([])
	const [data, setData] = useState([]);


	// 																County Demographic Data (3 dimensions)
	// const [labelAngles, setLabelAngles] = useState({
	// 	"white_ratio": 0,
	// 	"age_median": 120,
	// 	"income_per_capita": 240,
	// })
	// let anchorLabels = {
	// 	"white_ratio": 'white ratio',
	// 	"age_median": 'age median',
	// 	"income_per_capita": 'income per capita',
	// }
	// async function fetchRawData() {
	// 	let res = await axios('./radviz_demographic_data.json')
	// 	setRawData(res.data)
	// }


	// 																Redistricting Data (3 dimensions)
	// const [labelAngles, setLabelAngles] = useState({
	// 	"Population Equality": 0,
	// 	"Polsby Popper": 120,
	// 	"Objective Function": 240
	// })
	// let anchorLabels = {
	// 	"Population Equality": "Population Equality",
	// 	"Polsby Popper": "Polsby Popper",
	// 	"Objective Function": "Objective Function",
	// }
	// async function fetchRawData() {
	// 	let res = await axios('./bruh_george.json')
	// 	setRawData(res.data)
	// }


	// 																Redistricting Data (5 dimensions)
	const [labelAngles, setLabelAngles] = useState({
		"Population Equality": 0,
		"Polsby Popper": 72,
		"Majority-Minority Seat Share": 144,
		"Democratic Seat Share": 216,
		"Efficiency Gap": 288,
	})
	let anchorLabels = {
		"Population Equality": "Pop Eq",
		"Polsby Popper": "Polsby P",
		"Majority-Minority Seat Share": "MM Seat Share",
		"Democratic Seat Share": "Dem Seat Share",
		"Efficiency Gap": "Eff Gap",
	}
	async function fetchRawData() {
		let res = await axios('./new_bruh.json')
		setRawData(res.data)
	}

	useEffect(() => {
		fetchRawData()
	}, [])

	useEffect(() => {

		let { points, labels} = RawPositioning(rawData, anchorLabels, labelAngles)
		setData({ points, labels})

	}, [labelAngles, rawData])



	return (

		<div style={{ height: '100%', padding: '5px' }}>
			<div id='sidebar' style={{ display: 'flex' }}>
				<div style={{ width: '700px' }}>
					{useMemo(() => <Radviz points={data.points} labels={data.labels} std={data.std} />, [data])}
				</div>


				<div style={{ width: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
					{Object.keys(labelAngles).map(d =>
						<div className="d-flex justify-content-center my-4 control-container">
							<div style={{ width: '85%' }}>
								<div className='d-flex align-items-center justify-content-between'>
									<span className='control-labels'>{(d.replaceAll('_', ' ')).toLocaleUpperCase()}</span>
									<span for={d}
										className='control-value'
										style={{ width: '10px' }}>{labelAngles[d]}º</span>
								</div>
								<input type="range" className="custom-range" min="0" max="360"
									id={d}
									value={labelAngles[d]}
									onChange={(e) => {
										let updatedState = { ...labelAngles, [d]: e.target.value }
										setLabelAngles(updatedState)
									}} />
								<div className="ticks">
									<span class="tick">0º</span>
									<span class="tick">90º</span>
									<span class="tick">180º</span>
									<span class="tick">270º</span>
									<span class="tick">360º</span>
								</div>
							</div>
						</div>
					)}

				</div>
			</div>
		</div>
	);

}