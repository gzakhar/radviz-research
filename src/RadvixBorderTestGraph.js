import React, { useState, useRef } from 'react';
import RadvizD32 from './RadvizD32';
import axios from 'axios';
import Plot from 'react-plotly.js';

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


	// Sepal
	async function fetchData() {
		let res = await axios('./iris.json')
		setData(res.data)
	}
	let labelMapping = {
		sepalWidth: 'Sepal Width',
		sepalLength: 'Sepal Length',
		petalLength: 'Petal Length',
		petalWidth: 'Petal Width'
	};



	function handleClick(d, i) {
		show.current = true;
		console.log(i)
		setDotData(<DotDisplay dot={i} />);
	}


	return (
		<div style={{ display: 'flex', direction: 'row' }}>
			<div style={{ width: '50%', order: 1 }}>
				{/* <RadvizD32 labels={labelMapping} content={data} colorAccessor="color" textLabel='text' handleMouseClick={handleClick} /> */}
				<RadvizD32 labels={labelMapping} content={data} colorAccessor="species" textLabel='species' handleMouseClick={handleClick} />
				{data && vizData(data, labelMapping)}
			</div>
			<div style={{ width: '50%', order: 0 }}>
				{show.current && dotData}
				<button onClick={fetchData} className={'btn'} style={{ backgroundColor: "#fa7f72", color: "#ffffff" }}>fetchData</button>
			</div>
		</div>
	)

}
export default RadvixBorderTestGraph;