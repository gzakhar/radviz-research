import React, { useEffect, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import axios from 'axios';
import { StaticMap } from 'react-map-gl';
import Radviz from './Radviz.js'
import RawPositioning from './RawPositioningDynamicLabels';
import HSLToRGB from './ColorConversion.js';

let rad2deg = rad => rad * 180 / Math.PI;

const labels = [
	"Polsby Popper",
	"Efficiency Gap",
	"Population Equality",
	"Democratic Seat Share",
	// "Majority-Minority Seat Share",
	// "democraticSeats"
]

const depth = "Democratic Seat Share"


export default function App() {

	const [rawData, setRawData] = useState([])
	const [data, setData] = useState([]);
	const [labelAngles, setLabelAngles] = useState(labels.reduce((prev, label, indx) => ({ ...prev, [label]: (360 / labels.length) * indx }), {}))


	let labelMapping = {
		"Polsby Popper": "Polsby P",
		"Efficiency Gap": "Efficiency",
		"Population Equality": "Population Eq",
		"Democratic Seat Share": "Dem SS",
		"Majority-Minority Seat Share": "Maj-Min SS",
		"democraticSeats": "Dem Seats",
	}

	useEffect(() => {
		fetchRawData()
	}, [])

	useEffect(() => {

		// Statistical and Regualr require different label Mappings.
		let { points, labels, std } = RawPositioning(rawData, labelMapping, labelAngles, depth, 'id')
		setData({ points, labels, std })

	}, [labelAngles, rawData])

	async function fetchRawData() {
		let res = await axios('./ARSData.json')
		setRawData(res.data)
	}



	return (
		<div>
			<div style={{ width: '100%', height: '100%', position: 'fixed', padding: '5px' }}>
				<div id='sidebar'>
					{useMemo(() => <Radviz points={data.points} labels={data.labels} std={data.std} showHSV={false} />, [data])}
				</div>
			</div>
		</div>
	);
}

