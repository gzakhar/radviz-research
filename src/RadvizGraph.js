import React, { useState } from 'react';
import RadvizD3 from './RadvizD3';
import RadvizStatisticalD3 from './RadvizStatisticalD3'
import axios from 'axios';
import { std, mean } from 'mathjs';
import Plot from 'react-plotly.js';
import _ from 'lodash'

function normalize(data) {

	let normalizedData = _.cloneDeep(data);
	let min = Number.MAX_SAFE_INTEGER
	let max = Number.MIN_SAFE_INTEGER

	let dim = (() => {
		const stats = { label: [], mean: [], stddiv: [] }
		if (data != null) {
			Object.keys(data[0]).forEach(d => {
				if (d != "species") {
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

	console.log(dim);

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

function RadvizGraph() {
	const [data, setData] = useState(null);

	async function fetchData() {
		// let res = await axios('https://rawgit.com/biovisualize/radviz/master/data/iris.json');
		let res = await axios('./iris.json')
		// let res = await axios('./gdp.json')
		setData(res.data)
	}


	// let labelMapping = {
	// 	'2020:Q1': 'Q1',
	// 	'2020:Q2': 'Q2',
	// 	'2020:Q3': 'Q3',
	// }

	let labelMapping = {
		sepalWidth: 'Sepal Width',
		sepalLength: 'Sepal Length',
		petalLength: 'Petal Length',
		petalWidth: 'Petal Width'
	};





	let [normalizedData, min, max] = normalize(data);

	// console.log(data)

	return (
		<div style={{ display: 'flex', flexDirection: 'row' }}>
			<div style={{ order: 1, width: '50%' }}>
				{/* {data && <RadvizD3 labels={labelMapping} colorAccessor = "species" content={data}/>} */}
				<RadvizD3 labels={labelMapping} content={data} />
				{/* <RadvizStatisticalD3 labels={labelMapping} colorAccessor="species" content={normalizedData} min={min} max={max}/> */}
				{/* <RadvizD3 labels={labelMapping} colorAccessor="species" content={normalizedData} /> */}
				<button onClick={fetchData}>fetchData</button>
			</div>
			<div style={{ order: 2, width: '50%' }}>
				<div style={{ display: 'flex', flexDirection: 'column' }}>

					{data &&
						vizData(normalizedData, labelMapping)
					}
				</div>
			</div>
		</div>
	)

}
export default RadvizGraph;