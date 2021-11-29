import React, { useEffect, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import axios from 'axios';
import Radviz from './Radviz.js'
import RawPositioning from './RawPositioningDynamicLabels';
import { StaticMap } from 'react-map-gl';
import { useLocation, Link } from 'react-router-dom';
import HSLToRGB from '../UI/ColorConversion.js';
import { states } from '../StatePositions.js'

let rad2deg = rad => rad * 180 / Math.PI;

function useQuery() {
	const { search } = useLocation();

	return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function RadvizDemographic() {

	let query = useQuery();
	const selectedState = (query.get("stateId") || 0) < states.length ? query.get("stateId") : 0
	const showAnchorControls = query.get("showAnchorControls") ? (query.get("showAnchorControls") == "True" ? true : false) : false
	const googleForm = query.get("form") ? query.get("form") : 'None'
	const [rawData, setRawData] = useState([])
	const [geoJsonData, setGeoJsonData] = useState([])
	const [data, setData] = useState([]);
	const [countyColorMap, setCountyColorMap] = useState({});
	const [hoverCounty, setHoverCounty] = useState(-1)
	const [labelAngles, setLabelAngles] = useState({
		"white_ratio": 0,
		"age_median": 120,
		"income_per_capita": 240,
	})
	let isHovering = false
	let labelMapping = {
		"white_ratio": 'WHITE RATIO',
		"age_median": 'AGE MEDIAN',
		"income_per_capita": 'INCOME/CAPITA',
	}
	const [isCopied, setIsCopied] = useState(false)

	if (isCopied) {
		setTimeout(() => setIsCopied(false), 500)
	}

	useEffect(() => {
		fetchRawData()
		fetchGeoJsonData()
	}, [])

	useEffect(() => {

		// Statistical and Regualr require different label Mappings.
		let { points, labels, std } = RawPositioning(rawData, labelMapping, labelAngles, 'county_name')
		setData({ points, labels, std })

		let countyColorMap = {}
		points.forEach((county) => {
			countyColorMap[county['data']['county_name']] = `hsl(${rad2deg(county.coordinates.angle)}, ${county.coordinates.radius * 100}%, ${75 - (25 * county.coordinates.radius)}%)`
		})
		setCountyColorMap(countyColorMap)

	}, [labelAngles, rawData])

	async function fetchRawData() {
		let res = await axios('./radvizData' + states[selectedState]['demographics'])
		setRawData(res.data)
	}

	async function fetchGeoJsonData() {
		let res = await axios('./radvizData' + states[selectedState]['geometry'])
		setGeoJsonData(res.data['features'])
	}

	function getCountyColor(county) {
		let countyName = county.properties['county_name']
		let hsl = countyColorMap[countyName]
		let rgb = HSLToRGB(hsl)
		if (countyName == hoverCounty) {
			rgb = [0, 0, 0]
		}
		let rgba = [...rgb, 200]
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
					<div className='d-flex justify-content-between' style={{ height: '38px' }}>
						<Link className="btn btn-secondary" to='/survey'>Back</Link>
						<p style={{ color: '#DDDDDD', fontSize: '20px', fontWeight: '700' }}>
							<span style={{ color: 'green', fontWeight: '500', fontSize: '15px' }}>
								{isCopied ? 'Copied! ' : ''}
							</span>
							{hoverCounty == -1 ? ' ' : hoverCounty}
						</p>
					</div>
					{useMemo(() => <Radviz
						points={data.points}
						labels={data.labels}
						hoverId={hoverCounty}
						onClick={() => {
							setIsCopied(true)
							navigator.clipboard.writeText(hoverCounty)
						}}
						hoverOver={setHoverCounty} />, [data, hoverCounty])}
					{showAnchorControls ?
						<div>
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
						:
						<></>
					}
				</div>
			</div>
			<div className="map-container" >
				<DeckGL
					initialViewState={states[selectedState]['mapView']}
					controller={true}
					layers={[countyLayer]}
					getCursor={() => (isHovering ? "pointer" : "grab")}
				>
					<StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} />
				</DeckGL>
			</div>
			<div className='quiz-container'>
				<iframe style={{ height: '100%', width: '100%' }}
					src={googleForm} />
			</div>
		</div>
	);
}

