import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import RawPositioning from './RawPositioning.js'
import Radviz from './RadvizSTD.js'
import 'rc-slider/assets/index.css';

export default function App() {

	const [rawData, setRawData] = useState([])
	const [data, setData] = useState({});
	const [hoverKey, setHoverKey] = useState(-1)

	let labelMapping = {
		'Democratic Seat Share': 'dem seat',
		'Efficiency Gap': 'eff gap',
		'Majority-Minority Seat Share': 'maj/min seat',
		'Polsby Popper': 'p Popper',
		'Population Equality': 'pop eq',
	}

	const [labelAngles, setLabelAngles] = useState({
		'Democratic Seat Share': 70,
		'Efficiency Gap': 140,
		'Majority-Minority Seat Share': 210,
		'Polsby Popper': 280,
		'Population Equality': 350
	})

	useEffect(async () => {
		let res = await axios('./new_bruh.json')
		let data = res.data.map((d, i) => ({key: i, ...d}))
		setRawData(data)
	}, [])

	useEffect(() => {

		// Statistical and Regualr require different label Mappings.
		let { points, labels, std } = RawPositioning(rawData, labelMapping, labelAngles, 'key')
		// downloadObjectAsJson(points, 'text')
		setData({ points, labels, std })
	}, [labelAngles, rawData])


	function downloadObjectAsJson(list, exportName){
		var json = JSON.stringify(list);
		var blob = new Blob([json], {type: 'application/json'});
		var link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = exportName;
		link.click();
	  }


	return (
		<div>
			<div style={{ width: '30%', height: '100%', position: 'fixed', padding: '5px' }}>
				<div id='sidebar'>
					{useMemo(() => <Radviz
						points={data.points}
						labels={data.labels}
						hoverId={hoverKey}
						hoverOver={setHoverKey}
						showHSV={true} />, [data, hoverKey])}
				</div>
			</div>
		</div >
	);
}

