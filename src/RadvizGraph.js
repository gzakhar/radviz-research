import React, { useState } from 'react';
import RadvizD3 from './RadvizD3';
import RadvizStatisticalD3 from './RadvizStatisticalD3'
import RadvizD32 from './RadvizD32';
import axios from 'axios';
import { std, mean } from 'mathjs';
import Plot from 'react-plotly.js';
import _ from 'lodash'

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
	// 	age_median: 'Old',
	// 	white_ratio: 'Colored',
	// 	income_per_capita: 'Poor'
	// }
	// let oppositeLabel = {
	// 	age_median: 'Young',
	// 	white_ratio: 'White',
	// 	income_per_capita: 'Rich'
	// }
	// let colorAccessor = 'county_name'

	async function fetchData() {
		let res = await axios('./bruh_geogre.json')
		setData(res.data)
	}
	let labelMapping = {
		'Population Equality': "+Pop Equality",
		'Polsby Popper': "+Polsby Popper",
		'Objective Function': "+Objective Func"
	};
	let oppositeLabel = {
		'Population Equality': "-Pop Equality",
		'Polsby Popper': "-Polsby Popper",
		'Objective Function': "-Objective Func"
	};
	let colorAccessor = NaN

	let [normalizedData, min, max] = normalize(data, colorAccessor);

	return (
		<div style={{ display: 'flex', flexDirection: 'row' }}>
			<div style={{ order: 1, width: '50%' }}>
				{/* <RadvizD3 labels={labelMapping} content={data} colorAccessor={colorAccessor} /> */}
				<RadvizD32 labels={labelMapping} content={data} colorAccessor="color" textLabel='text' zoom={false} />
				{/* <RadvizStatisticalD3 oppositeLabel={oppositeLabel} labels={labelMapping} colorAccessor={colorAccessor} content={normalizedData} min={min} max={max} /> */}
				<button onClick={fetchData} className='btn' style={{ backgroundColor: "#fa7f72", color: "#000000" }}>fetchData</button>
			</div>
			<div style={{ order: 2, width: '50%' }}>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					{data &&
						// vizData(data, labelMapping)
						vizData(normalizedData, labelMapping)
					}
				</div>
			</div>
		</div>
	)

}
export default RadvizGraph;