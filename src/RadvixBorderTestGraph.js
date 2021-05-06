import React, { useState, useRef } from 'react';
import RadvizD32 from './RadvizD32';
import axios from 'axios';
import Plot from 'react-plotly.js';
import _ from 'lodash'
import { std, mean } from 'mathjs';

function vizData(data, labels) {
	return Object.keys(labels).map(element => <Plot
		data={[
			{
				x: data.reduce((accumulator, currentVal) => {
					accumulator.push(currentVal[element])
					return accumulator
				}, []),
				type: 'histogram',
			}
		]}
		layout={{ height: 240, title: labels[element] }}
		hoverinfo='none'
	/>)
}

function normalize(data, colorAccessor) {

	let normalizedData = _.cloneDeep(data);
	let min = Number.MAX_SAFE_INTEGER
	let max = Number.MIN_SAFE_INTEGER

	let dim = (() => {
		const stats = { label: [], mean: [], stddiv: [] }
		if (data != null) {
			Object.keys(data[0]).forEach(d => {
				if (d != colorAccessor) {
					let temp = [];
					data.forEach(r => {
						temp.push(r[d])
					})
					stats.mean.push(mean(temp));
					stats.stddiv.push(std(temp))
					stats.label.push(d)
				}
			})
		}
		return stats;
	})();

	if (data != null) {
		normalizedData.map(row => {
			dim.label.forEach(d => {
				let i = dim.label.indexOf(d)
				row[d] = (row[d] - dim.mean[i]) / dim.stddiv[i];
				if (row[d] < min) min = row[d]
				if (row[d] > max) max = row[d]
			})
			return row;
		})
	}

	return [normalizedData, min, max];
}

function DotDisplay(props) {
	let keys = Object.keys(props.dot.data)
	let cKeys = Object.keys(props.dot.coordinates)
	return (
		<div className="d-flex">
			<div className="card bg-light mb-3" style={{ maxWidth: '30rem' }}>
				<div className="card-header">Plans</div>
				<div className="card-body">
					{keys.map(e => <p>{e}: {props.dot.data[e].toFixed(6)}</p>)}
				</div>
			</div>
			<div className="card bg-light mb-3" style={{ maxWidth: '30rem' }}>
				<div className="card-header">Dot Coordinates</div>
				<div className="card-body">
					{cKeys.map(e => <p>{e}: {props.dot.coordinates[e].toFixed(4)}</p>)}
				</div>
			</div>
			
		</div>
	)
}

function RadvixBorderTestGraph() {

	const [data, setData] = useState(null);
	const [dotData, setDotData] = useState([]);
	const show = useRef(false);
	const [zoom, setZoom] = useState(false);

	// async function fetchData() {
	// 	let res = await axios('./borderTest.json')
	// 	setData(res.data)
	// }
	// let labelMapping = {
	// 	top: 'Top',
	// 	right: 'Right',
	// 	bottom: 'Bottom',
	// 	left: 'Left',
	// 	tt: 'TT'
	// };
	// let colorAccessor = 'text'

	// async function fetchData() {
	// 	let res = await axios('./iris.json')
	// 	setData(res.data)
	// }
	// let labelMapping = {
	// 	sepalWidth: 'Sepal Width',
	// 	sepalLength: 'Sepal Length',
	// 	petalLength: 'Petal Length',
	// 	petalWidth: 'Petal Width'
	// };
	// let colorAccessor = 'species'


	// let labelMapping = {
	// 	'2020:Q1': 'Q1',
	// 	'2020:Q2': 'Q2',
	// 	'2020:Q3': 'Q3',
	// }
	// let colorAccessor = 'GeoName'
	// async function fetchData() {
	// 	let res = await axios('./gdp.json')
	// 	setData(res.data)
	// }

	// async function fetchData() {
	// 	let res = await axios('./radviz_demographic_data.json')
	// 	setData(res.data)
	// }
	// let labelMapping = {
	// 	age_median: 'Age Median',
	// 	white_ratio: 'White Ratio',
	// 	income_per_capita: 'Income Per Capita'
	// };
	// let colorAccessor = 'county_name'


	async function fetchData() {
		let res = await axios('./new_bruh.json')
		setData(res.data)
	}
	let labelMapping = {
		'Population Equality': "Population Equality",
		'Polsby Popper': "Polsby Popper",
		'Majority-Minority Seat Share': "MMSeat",
		// 'Democratic Seat Share': "DemSeatShare",
		// 'Efficiency Gap': "Efficiency Gap"
	};
	let colorAccessor = null



	function handleClick(i, d) {
		show.current = true;
		console.log(d)
		setDotData(d)
	}

	function normalizeData() {
		let [norm, min, max] = normalize(data, colorAccessor)
		setData(norm)
	}

	return (
		<div style={{ display: 'flex', direction: 'row' }}>
			<div style={{ width: '40%', order: 1 }}>

				{/* <RadvizD32 labels={labelMapping} content={data} colorAccessor="color" textLabel='text' handleMouseClick={handleClick} zoom={false} /> */}
				{/* <RadvizD32 labels={labelMapping} content={data} colorAccessor={colorAccessor} textLabel='GeoName' handleMouseClick={handleClick} zoom={false}/> */}
				<RadvizD32 labels={labelMapping} content={data} colorAccessor={colorAccessor} textLabel={colorAccessor} handleMouseClick={handleClick} zoom={zoom} />


				<button onClick={fetchData} className={'btn'} style={{ backgroundColor: "#fa7f72", color: "#000000" }}>Fetch Data</button>
				<button onClick={normalizeData} className={'btn'} style={{ backgroundColor: "#1631ff", color: "#ffffff" }}>Normalize</button>
				<button onClick={() => setZoom(!zoom)} className={'btn'} style={{ backgroundColor: "#4cfeb4", color: "#000000" }}>Zoom {zoom ? "true" : "false"}</button>
				{dotData.length != 0 ? <DotDisplay dot={dotData} /> : null}

			</div>
			<div style={{ width: '60%', order: 0 }}>
				{data && vizData(data, labelMapping)}
			</div>
		</div>
	)

}
export default RadvixBorderTestGraph;