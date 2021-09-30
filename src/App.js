import React, { useEffect, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import axios from 'axios';
// import RawPositioning from './RawPositioningMuellerVizSTD.js'
import Radviz from './Radviz.js'
import RawPositioning from './RawPositioningDynamicLabels';
// import RawPositioning from './RawPositioningMuellerViz.js';
// import { radvizMapper as RawPositioning, Radviz } from 'react-d3-radviz'
import { StaticMap } from 'react-map-gl';
import HSLToRGB from './ColorConversion.js';


let rad2deg = rad => rad * 180 / Math.PI;

export default function App() {

	const [rawData, setRawData] = useState([])
	const [geoJsonData, setGeoJsonData] = useState({})
	const [data, setData] = useState([]);
	const [countyColorMap, setCountyColorMap] = useState({});
	const [stddiv, setStddiv] = useState(1)
	const [labelAngles, setLabelAngles] = useState({
		"white_ratio": 0,
		"age_median": 60,
		"income_per_capita": 120,
	})

	let labelMapping = {
		"white_ratio": 'white ratio',
		"age_median": 'age median',
		"income_per_capita": 'income per capita',
	}

	let labelMappingMueller = {
		"white_ratio": { high: 'white', low: 'non-white' },
		"age_median": { high: 'old', low: 'young' },
		"income_per_capita": { high: 'rich', low: 'poor' },
	}

	let labelMapingARSData = {
		"Polsby Popper": "abc",
		"Efficiency Gap": "abc",
		"Population Equality": "abc",
		"Democratic Seat Share": "abc",
		"Majority-Minority Seat Share": "abc",
		"democraticSeats": "abc",
	}


	useEffect(() => {
		fetchRawData()
		fetchGeoJsonData()
	}, [])

	useEffect(() => {

		// Statistical and Regualr require different label Mappings.
		// let { points, labels, std } = RawPositioning(rawData, labelMapping, labelAngles, 'county_name')
		let { points, labels, std } = RawPositioning(rawData, labelMapingARSData, labelAngles, stddiv, 'county_name', true)
		setData({ points, labels, std })

		let countyColorMap = {}
		points.forEach((county) => {
			countyColorMap[county['data']['county_name']] = `hsl(${rad2deg(county.coordinates.angle)}, ${county.coordinates.radius * 100}%, ${75 - (25 * county.coordinates.radius)}%)`
			// countyColorMap[county['data']['county_name']] = `hsl(${rad2deg(county.coordinates.angle)}, ${county.coordinates.radius * 100}%, ${100 - (50 * county.coordinates.radius)}%)`
		})
		setCountyColorMap(countyColorMap)

	}, [labelAngles, rawData, stddiv])

	async function fetchRawData() {
		let res = await axios('./radviz_demographic_data.json')
		setRawData(res.data)
	}

	async function fetchGeoJsonData() {
		let res = await axios('./NYCounties.json')
		setGeoJsonData(res.data['features'])
	}

	function getCountyColor(county) {
		let countyName = county.properties['NAMELSAD20']
		let hsl = countyColorMap[countyName]
		let rgb = HSLToRGB(hsl)
		let rgba = [...rgb, 200]
		return rgba
	}

	const countyLayer = new GeoJsonLayer({
		id: 'geojson-layer',
		data: geoJsonData,
		pickable: true,
		stroked: true,
		filled: true,
		lineWidthUnits: 'pixels',
		getFillColor: (d) => getCountyColor(d),
		getLineColor: [250, 250, 250, 255],
		getLineWidth: 1,
		updateTriggers: { getFillColor: [getCountyColor] }
	})

	return (
		<div>
			<div style={{ width: '30%', height: '100%', position: 'fixed', padding: '5px' }}>
				<div id='sidebar'>
					{useMemo(() => <Radviz points={data.points} labels={data.labels} std={data.std} />, [data])}
					<div>
						<div className="d-flex justify-content-center my-4">
							<div style={{ width: '75%' }}>
								<div className='d-flex align-items-center justify-content-between'>
									<span className='control-labels'>STD</span>
									<span
										for={'std'}
										className='control-value'
										style={{ color: '#DDDDDD' }}>{stddiv}</span>
								</div>
								<input type="range" className="custom-range" min="0" max="3"
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
			<div className="map-container" >
				<DeckGL
					initialViewState={{
						longitude: -76.0861,
						latitude: 42.9420,
						zoom: 6.38
					}}
					controller={true}
					layers={[countyLayer]}
				>
					<StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} />
				</DeckGL>
			</div>
		</div>
	);
}

