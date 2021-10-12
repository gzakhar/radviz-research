import React, { useEffect, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import axios from 'axios';
import Radviz from './Radviz.js'
import RawPositioning from './RawPositioningDynamicLabels';
import { StaticMap } from 'react-map-gl';
import HSLToRGB from './ColorConversion.js';


let rad2deg = rad => rad * 180 / Math.PI;

export default function App() {

	const [rawData, setRawData] = useState([])
	const [geoJsonData, setGeoJsonData] = useState({})
	const [data, setData] = useState([]);
	const [countyColorMap, setCountyColorMap] = useState({});
	const [labelAngles, setLabelAngles] = useState({
		"white_ratio": 0,
		"age_median": 120,
		"income_per_capita": 240,
	})

	let labelMapping = {
		"white_ratio": 'white ratio',
		"age_median": 'age median',
		"income_per_capita": 'income per capita',
	}

	useEffect(() => {
		fetchRawData()
		fetchGeoJsonData()
	}, [])

	useEffect(() => {

		// Statistical and Regualr require different label Mappings.
		let { points, labels, std } = RawPositioning(rawData, labelMapping, labelAngles, 'f_depth', 'county_name')
		setData({ points, labels, std })

		let countyColorMap = {}
		points.forEach((county) => {
			countyColorMap[county['data']['county_name']] = `hsl(${rad2deg(county.coordinates.angle)}, ${county.coordinates.radius * 100}%, ${75 - (25 * county.coordinates.radius)}%)`
		})
		setCountyColorMap(countyColorMap)

	}, [labelAngles, rawData])

	async function fetchRawData() {
		let res = await axios('./radviz_demographic_data_depth.json')
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
					{useMemo(() => <Radviz points={data.points} labels={data.labels} std={data.std} depthControl={'f_depth'} />, [data])}
					{Object.keys(labelAngles).map(d =>
						<div className="d-flex justify-content-center my-4 control-container">
							<div style={{ width: '85%' }}>
								<div className='d-flex align-items-center justify-content-between'>
									<span className='control-labels'>{(d.replaceAll('_', ' ')).toLocaleUpperCase()}</span>
									<span htmlFor={d}
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
									<span className="tick">0º</span>
									<span className="tick">90º</span>
									<span className="tick">180º</span>
									<span className="tick">270º</span>
									<span className="tick">360º</span>
								</div>
							</div>
						</div>
					)}
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

