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
	return (
		<div className="card" style={{ width: "18rem" }}>
			<div className="card-header">
				{props.dot.textLabel}
			</div>
			<ul className="list-group list-group-flush">
				<li className="list-group-item">x: {props.dot.coordinates.x}</li>
				<li className="list-group-item">y: {props.dot.coordinates.y}</li>
			</ul>
		</div>
	)
}

function RadvixBorderTestGraph() {

	const [data, setData] = useState(null);
	const [dotData, setDotData] = useState(null);
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
		let res = await axios('./bruh_geogre.json')
		setData(res.data)
	}
	let labelMapping = {
		'Population Equality' : "Population Equality",
		'Polsby Popper' : "Polsby Popper",
		'Objective Function' : "Objective Function"
	};
	let colorAccessor = NaN



	function handleClick(d, i) {
		show.current = true;
		console.log(i)
		setDotData(<DotDisplay dot={i} />);
	}

	function normalizeData() {
		let [norm, min, max] = normalize(data, colorAccessor)
		setData(norm)
	}

	return (
		<div style={{ display: 'flex', direction: 'row' }}>
			<div style={{ width: '50%', order: 1 }}>
				{/* <RadvizD32 labels={labelMapping} content={data} colorAccessor="color" textLabel='text' handleMouseClick={handleClick} zoom={false} /> */}
				<RadvizD32 labels={labelMapping} content={data} colorAccessor={colorAccessor} textLabel={colorAccessor} handleMouseClick={handleClick} zoom={false} />
				{/* <RadvizD32 labels={labelMapping} content={data} colorAccessor={colorAccessor} textLabel='GeoName' handleMouseClick={handleClick} zoom={false}/> */}


				<button onClick={fetchData} className={'btn'} style={{ backgroundColor: "#fa7f72", color: "#000000" }}>fetchData</button>
				<button onClick={normalizeData} className={'btn'} style={{ backgroundColor: "#1631ff", color: "#ffffff" }}>Normalize</button>
				<button onClick={console.log(zoom)} className={'btn'} style={{ backgroundColor: "#4cfeb4", color: "#000000" }}>Zoom</button>
			</div>
			<div style={{ width: '50%', order: 0 }}>
				{show.current && dotData}
				{data && vizData(data, labelMapping)}

			</div>
		</div>
	)

}
export default RadvixBorderTestGraph;