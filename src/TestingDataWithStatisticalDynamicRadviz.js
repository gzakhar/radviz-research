import React, { useEffect, useState, useMemo } from 'react';
import { RawPositioning } from './RawPositioningMuellerViz';
import Radviz from './Radviz';
import axios from 'axios'


export default function TestingDataWithStatisticalDynamicRadviz() {

	const [rawData, setRawData] = useState([])
	const [data, setData] = useState([]);
	const [stddiv, setStddiv] = useState(3)


	// 																County Demographic Data (3 dimensions)
	// const [labelAngles, setLabelAngles] = useState({
	// 	"white_ratio": 0,
	// 	"age_median": 120,
	// 	"income_per_capita": 240,
	// })
	// let anchorLabels = {
	// 	"white_ratio": { high: 'white', low: 'colored' },
	// 	"age_median": { high: 'old', low: 'young' },
	// 	"income_per_capita": { high: 'rich', low: 'poor' },
	// }
	// async function fetchRawData() {
	// 	let res = await axios('./radviz_demographic_data.json')
	// 	setRawData(res.data)
	// }


	// 																Redistricting Data (3 dimensions)
	// const [labelAngles, setLabelAngles] = useState({
	// 	"Population Equality": 0,
	// 	"Polsby Popper": 60,
	// 	"Objective Function": 120
	// })
	// let anchorLabels = {
	// 	"Population Equality": { high: '+pop eq', low: '-pop eq' },
	// 	"Polsby Popper": { high: '+polsby p', low: '-polsby p' },
	// 	"Objective Function": { high: '+obj f', low: '-obj f' },
	// }
	// async function fetchRawData() {
	// 	let res = await axios('./bruh_george.json')
	// 	console.log(res.data.length)
	// 	setRawData(res.data)
	// }


	// 																Redistricting Data (5 dimensions)
	const [labelAngles, setLabelAngles] = useState({
		"Population Equality": 0,
		"Polsby Popper": 60,
		// "Majority-Minority Seat Share": 120,
		// "Democratic Seat Share":  130,
		"Efficiency Gap": 140,
	})
	let anchorLabels = {
		"Population Equality": { high: '+pe', low: '-pe' },
		"Polsby Popper": { high: '+pp', low: '-pp' },
		// "Majority-Minority Seat Share": { high: '+mmss', low: '-mmss' },
		// "Democratic Seat Share":  { high: '+dss', low: '-dss' },
		"Efficiency Gap": { high: '+ef', low: '-ef' },
	}
	async function fetchRawData() {
		let res = await axios('./new_bruh.json')
		setRawData(res.data)
	}

	useEffect(() => {
		fetchRawData()
	}, [])

	useEffect(() => {

		let { points, labels, std } = RawPositioning(rawData, anchorLabels, labelAngles, stddiv)
		setData({ points, labels, std })

	}, [labelAngles, rawData, stddiv])



	return (

		<div style={{ height: '100%', padding: '5px' }}>
			<div id='sidebar' style={{ display: 'flex' }}>
				<div style={{ width: '700px' }}>
					{useMemo(() => <Radviz points={data.points} labels={data.labels} std={data.std} />, [data])}
				</div>

				<div style={{ width: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
					<div className="d-flex justify-content-center my-4">
						<div style={{ width: '75%' }}>
							<div className='d-flex align-items-center justify-content-between'>
								<span className='control-labels'>Standard Deviation</span>
								<span
									for={'std'}
									className='control-value'
									style={{ color: '#DDDDDD' }}>{stddiv}</span>
							</div>
							<input type="range" className="custom-range" min="0" max="4"
								id={'std'}
								value={stddiv}
								onChange={(e) => setStddiv(e.target.value)} />
						</div>
					</div>

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