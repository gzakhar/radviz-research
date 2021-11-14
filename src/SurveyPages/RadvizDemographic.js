import React, { useEffect, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import axios from 'axios';
import { Radviz } from 'react-d3-radviz';
import RawPositioning from './RawPositioningDynamicLabels';
import { StaticMap } from 'react-map-gl';
import { useParams } from 'react-router-dom';
import HSLToRGB from '../UI/ColorConversion.js';

let rad2deg = rad => rad * 180 / Math.PI;

export default function RadvizDemographic() {

	const { showControls } = useParams();
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
		let opacity = 200
		if (countyName == hoverCounty) {
			rgb = [0, 0, 0]
		}
		let rgba = [...rgb, opacity]
		return rgba
	}

	let countyLayer = {}

	if (data.points && geoJsonData) {
		countyLayer = data.points.map((point) => {

			let geoData = geoJsonData.find(obj => obj.properties['NAMELSAD20'] == point.data['county_name']);

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
						hoverOver={setHoverCounty} />, [data])}


					{showControls == 'show' ?
						<div>
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
						:
						<></>
					}
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

