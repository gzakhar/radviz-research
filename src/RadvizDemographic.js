import React, { useEffect, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import axios from 'axios';
import { Radviz } from 'react-d3-radviz';
import RawPositioning from './RawPositioningDynamicLabels';
import { StaticMap } from 'react-map-gl';

let rad2deg = rad => rad * 180 / Math.PI;

export default function RadvizDemographic() {

	const [rawData, setRawData] = useState([])
	const [geoJsonData, setGeoJsonData] = useState({})
	const [data, setData] = useState([]);
	const [countyColorMap, setCountyColorMap] = useState({});
	const offset = 360 * Math.random()
	const [labelAngles, setLabelAngles] = useState({
		"white_ratio": Math.round(offset % 360),
		"age_median": Math.round(offset + 120) % 360,
		"income_per_capita": Math.round(offset + 240) % 360
	})

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

	function HSLToRGB(hsl) {
		let sep = hsl.indexOf(",") > -1 ? "," : " ";
		hsl = hsl.substr(4).split(")")[0].split(sep);

		let h = hsl[0],
			s = hsl[1].substr(0, hsl[1].length - 1) / 100,
			l = hsl[2].substr(0, hsl[2].length - 1) / 100;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs((h / 60) % 2 - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c; g = x; b = 0;
		} else if (60 <= h && h < 120) {
			r = x; g = c; b = 0;
		} else if (120 <= h && h < 180) {
			r = 0; g = c; b = x;
		} else if (180 <= h && h < 240) {
			r = 0; g = x; b = c;
		} else if (240 <= h && h < 300) {
			r = x; g = 0; b = c;
		} else if (300 <= h && h < 360) {
			r = c; g = 0; b = x;
		}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);
		return [r, g, b]
	}

	return (
		<div>
			<div style={{ width: '30%', height: '100%', position: 'fixed', padding: '5px' }}>
				<div id='sidebar'>
					{useMemo(() => <Radviz points={data.points} labels={data.labels} />, [data])}
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

