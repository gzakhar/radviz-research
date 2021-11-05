import React, { useEffect, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import axios from 'axios';
import RawPositioning from './RawPositioningMuellerVizSTD.js'
import Radviz from './RadvizSTD.js'
// import RawPositioning from './RawPositioningDynamicLabels';
// import { radvizMapper as RawPositioning, Radviz } from 'react-d3-radviz'
import { StaticMap } from 'react-map-gl';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import HSLToRGB from './ColorConversion.js';

let rad2deg = rad => rad * 180 / Math.PI;

export default function App() {

	const [rawData, setRawData] = useState([])
	const [geoJsonData, setGeoJsonData] = useState([])
	const [data, setData] = useState({});
	const [countyColorMap, setCountyColorMap] = useState({});
	const [countyOpacityMap, setCountyOpacistyMap] = useState({});
	const [rangeValue, setRangeValue] = useState([100, 200, 300]);
	const [z2one, setZ2one] = useState(true);
	const [one2two, setOne2two] = useState(true);
	const [two2three, setTwo2three] = useState(true);
	const [three2inf, setThree2inf] = useState(true);
	const [hoverCounty, setHoverCounty] = useState(-1)
	const [labelAngles, setLabelAngles] = useState({
		"white_ratio": 0,
		"age_median": 60,
		"income_per_capita": 120,
	})
	let isHovering = false

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


	useEffect(() => {
		fetchRawData()
		fetchGeoJsonData()
	}, [])

	useEffect(() => {

		// Statistical and Regualr require different label Mappings.
		// let { points, labels, std } = RawPositioning(rawData, labelMapping, labelAngles, 'county_name')
		let { points, labels, std, std2, std3 } = RawPositioning(rawData, labelMappingMueller, labelAngles, rangeValue[0], rangeValue[1], rangeValue[2], 'county_name', true)
		setData({ points, labels, std, std2, std3 })

		let countyColorMap = {}
		points.forEach((county) => {
			countyColorMap[county['data']['county_name']] = `hsl(${rad2deg(county.coordinates.angle)}, ${county.coordinates.radius * 100}%, ${75 - (25 * county.coordinates.radius)}%)`
			// countyColorMap[county['data']['county_name']] = `hsl(${rad2deg(county.coordinates.angle)}, ${county.coordinates.radius * 100}%, ${100 - (50 * county.coordinates.radius)}%)`
		})
		setCountyColorMap(countyColorMap)

		let countyOpacistyMap = {}
		points.forEach((county) => {
			let r = county.coordinates.radius
			let isVisible = true
			switch (true) {
				case r <= std:
					isVisible = z2one
					break;
				case r <= std2:
					isVisible = one2two
					break;
				case r <= std3:
					isVisible = two2three
					break;
				default:
					isVisible = three2inf
					break;
			}
			countyOpacistyMap[county['data']['county_name']] = isVisible
		})
		setCountyOpacistyMap(countyOpacistyMap)

	}, [labelAngles, rawData, rangeValue, z2one, one2two, two2three, three2inf])

	async function fetchRawData() {
		const nyData = './nyDem.json'
		const njData = './njDem.json'
		let res = await axios(nyData)
		setRawData(res.data)
	}

	async function fetchGeoJsonData() {
		const nyGeo = './nyGeo.json'
		const njGeo = './njGeo.json'
		let res = await axios(nyGeo)
		setGeoJsonData(res.data['features'])
	}

	function getCountyColor(county) {
		let countyName = county.properties['county_name']
		let hsl = countyColorMap[countyName]
		let rgb = HSLToRGB(hsl)
		let opacity = countyOpacityMap[countyName]
		if (countyName == hoverCounty){
			opacity = 0
		}
		let rgba = [...rgb, opacity ? 200 : 0]
		return rgba
	}

	let countyLayer = {}

	if (data.points && geoJsonData) {
		countyLayer = data.points.map((point) => {

			let geoData = geoJsonData.find(obj => obj.properties['county_name'] == point.data['county_name']);

			let layer = new GeoJsonLayer({
				id: point.data.county_name,
				data: geoData,
				pickable: true,
				stroked: true,
				filled: true,
				lineWidthUnits: 'pixels',
				getFillColor: d => getCountyColor(d),
				getLineColor: [255, 255, 255],
				getLineWidth: 1,
				updateTriggers: { getFillColor: [getCountyColor], getLineColor: hoverCounty },
				onHover: d => {
					d.picked ? setHoverCounty(d.layer.id) : setHoverCounty(-1)
					isHovering = d.picked ? true : false
				},
				getCursor: 'pointer',
			})

			return layer
		}).reduce((prev, curr) => {
			prev.push(curr)
			return prev
		}, [])
	}


	return (
		<div>
			<div style={{ width: '30%', height: '100%', position: 'fixed', padding: '5px' }}>
				<div id='sidebar'>
					{useMemo(() => <Radviz
						points={data.points}
						labels={data.labels}
						hoverId={hoverCounty}
						hoverOver={setHoverCounty}
						std={data.std}
						std2={data.std2}
						std3={data.std3}
						shade={{ 'z2one': z2one, 'one2two': one2two, 'two2three': two2three, 'three2inf': three2inf }}
						showHSV={true} />, [data, hoverCounty])}
					<div>
						<div className='d-flex justify-content-around align-items-center' style={{ width: '80%', marginLeft: '50px', marginRight: '50px' }}>
							<div>
								<div style={{ color: 'white' }}>0-1</div>
								<input type="checkbox" checked={z2one} onChange={() => setZ2one(!z2one)} />
							</div>
							<div>
								<div style={{ color: 'white' }}>1-2</div>
								<input type="checkbox" checked={one2two} onChange={() => setOne2two(!one2two)} />
							</div>
							<div>
								<div style={{ color: 'white' }}>2-3</div>
								<input type="checkbox" checked={two2three} onChange={() => setTwo2three(!two2three)} />
							</div>
							<div>
								<div style={{ color: 'white' }}>3-inf</div>
								<input type="checkbox" checked={three2inf} onChange={() => setThree2inf(!three2inf)} />
							</div>
						</div>
						<div className="d-flex justify-content-center my-4">
							<div style={{ width: '75%' }}>
								<div className='d-flex align-items-center justify-content-between'>
									<span className='control-labels'>Standard Deviation</span>

								</div>
								<Range id={'std'} defaultValue={[100, 200, 300]} min={0} max={600} allowCross={false} onChange={(v) => setRangeValue(v)} pushable={5} />
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
					getCursor={() => (isHovering ? "pointer" : "grab")}
				>
					<StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} />
				</DeckGL>
			</div>
		</div>
	);
}

