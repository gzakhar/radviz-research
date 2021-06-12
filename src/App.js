import React, { useRef, useEffect, useState, useMemo } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import axios from 'axios';
import Radviz from './Radviz'
import { RawPositioning } from './RawPositioningDynamicLabels'


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

let rad2deg = rad => rad * 180 / Math.PI;

export default function App() {


	const mapContainer = useRef(null);
	const map = useRef(null);
	const [lng, setLng] = useState(-76.0861);
	const [lat, setLat] = useState(42.9420);
	const [zoom, setZoom] = useState(6.38);
	const [rawData, setRawData] = useState([])
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

		async function fetchData() {

			let res = await axios('./radviz_demographic_data.json')
			setRawData(res.data)
		}

		fetchData()
	}, [])


	useEffect(() => {

		let { points, labels } = RawPositioning({ 'content': rawData, 'labels': labelMapping, 'labelsDict': labelAngles })
		setData({ points, labels })

		let countyColorMap = {}
		points.forEach((county) => {
			countyColorMap[county['data']['county_name']] = `hsl(${rad2deg(county.coordinates.angle)}, ${county.coordinates.radius * 100}%, 50%)`
		})
		setCountyColorMap(countyColorMap)

	}, [labelAngles])

	useEffect(() => {
		if (map.current) return; // initialize map only once
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [lng, lat],
			zoom: zoom
		});
	}, []);

	useEffect(async () => {
		if (!map.current) return; // wait for map to initialize
		if (Object.keys(countyColorMap).length === 0) return;
		map.current.on('load', () => {

			let layers = map.current.getStyle().layers;
			// Find the index of the first symbol layer in the map style
			let firstSymbolId;
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].type === 'symbol') {
					firstSymbolId = layers[i].id;
					break;
				}
			}

			// Setting all the highway layer to visilibilty none
			for (let i = 35; i < 59; i++) {
				let level_name = layers[i].id;
				map.current.setLayoutProperty(level_name, 'visibility', 'none');
			}
			map.current.setLayoutProperty('road-label', 'visibility', 'none');
			map.current.setLayoutProperty('road-number-shield', 'visibility', 'none');


			axios('./NYCounties.json').then(res => {

				res.data['features'].forEach(feature => {

					let properties = feature['properties']
					properties['color'] = countyColorMap[properties['NAMELSAD20']]
				})

				map.current.addSource('counties', {
					'type': 'geojson',
					'data': res.data,
					'generateId': true // This ensures that all features have unique IDs
				});

				map.current.addLayer({
					id: "county-fills",
					type: 'fill',
					source: 'counties',
					layout: {},
					paint: {
						'fill-color': ['get', 'color'],
						'fill-opacity': [
							'case', ['boolean', ['feature-state', 'hover'], false],
							1,
							0.6
						]
					}
				}, firstSymbolId);

				map.current.addLayer({
					id: 'county-borders',
					type: 'line',
					source: 'counties',
					layout: {},
					paint: {
						'line-color': 'black',
						'line-width': 1
					}
				}, firstSymbolId)

				let hoveredCountyeId = null;

				map.current.on('mousemove', 'county-fills', (e) => {
					map.current.getCanvas().style.cursor = 'pointer';
					if (e.features.length > 0) {
						if (hoveredCountyeId) {
							// set the hover attribute to false with feature state
							map.current.setFeatureState({
								source: 'counties',
								id: hoveredCountyeId
							}, {
								hover: false
							});
						}

						hoveredCountyeId = e.features[0].id;
						// set the hover attribute to true with feature state
						map.current.setFeatureState({
							source: 'counties',
							id: hoveredCountyeId
						}, {
							hover: true
						});
					}
				});

			})

		});
	}, [countyColorMap]);

	useEffect(() => {
		if (!map.current) return; // wait for map to initialize
		map.current.on('move', () => {
			setLng(map.current.getCenter().lng.toFixed(4));
			setLat(map.current.getCenter().lat.toFixed(4));
			setZoom(map.current.getZoom().toFixed(2));
		});
	});


	return (
		<div>
			{/* <div style={{ width: '25%', height: '100%', overflow: 'auto', position: 'fixed' }}> */}
			<div style={{ width: '30%', height: '100%', position: 'fixed' }}>
				<div style={{
					backgroundColor: '#eeeeee',
					margin: '5px',
					border: 'solid',
					borderRadius: '10px',
					borderWidth: '2px',
					borderColor: 'black',
					padding: '10px'
				}}>
					<div>
						{useMemo(() => <Radviz points={data.points} labels={data.labels} />, [data])}
					</div>

					<div>
						{Object.keys(labelAngles).map(d =>
							<div class="d-flex justify-content-center my-4">
								<div class="w-75">
									<h7>{d}</h7>
									<input type="range" class="custom-range" min="0" max="360"
										id={d}
										value={labelAngles[d]}
										onChange={(e) => {
											let updatedState = { ...labelAngles, [d]: e.target.value }
											setLabelAngles(updatedState)
										}} />
								</div>
								<span for={d} class="font-weight-bold text-primary ml-2 valueSpan2"></span>
							</div>
						)}
					</div>
					<div className='d-flex flex-row-reverse'>
						<button className='btn btn-primary' onClick={console.log('recolor')}>Re-color</button>
					</div>
				</div>
			</div>
			<div className="sidebar">
				Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
			</div>
			<div ref={mapContainer} className="map-container" />
		</div>
	);
}

