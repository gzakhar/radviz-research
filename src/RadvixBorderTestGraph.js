import React, { useState } from 'react';
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

function RadvixBorderTestGraph() {
	const [data, setData] = useState(null);

	async function fetchData() {
		let res = await axios('./borderTest.json')
		setData(res.data)
	}

	let labelMapping = {
		top: 'Top',
		right: 'Right',
		bottom: 'Bottom',
		left: 'Left',
		tt: 'TT'
	};

	// console.log(data)

	return (
		<div style={{ display: 'flex', direction: 'row' }}>
			<div style={{ width: '100%', order: 1 }}>
				<RadvizD32 labels={labelMapping} content={data} colorAccessor="color" />
				<button onClick={fetchData}>fetchData</button>
			</div>
			<div style={{width: '50%', order: 1 }}>
				{/* {data && vizData(data, labelMapping)} */}
			</div>
		</div>
	)

}
export default RadvixBorderTestGraph;