import { useEffect, useRef } from 'react';
import { symbol, symbolCircle } from 'd3-shape';
import { scaleOrdinal, scaleLinear, scaleThreshold, scaleQuantize } from 'd3-scale';
import { range, extent, max } from 'd3-array';
import { select } from 'd3-selection';


function RadvizD3(props) {

	let MARGIN = 40;
	let CHART_R = 200;
	let HEMI_TOP = 0;
	let HEMI_BOTTOM = 1;
	let EPSILON = 0.0001;
	let BORDER_BUFF = 10;

	let theta;
	let dimension;
	let dotPalette = scaleOrdinal().range(['red', 'green', 'orange', 'blue', 'yellow']);

	let initialized = useRef(false);

	const HUE_STEPS = Array.apply(null, { length: 360 }).map((_, index) => index);

	// React Hook.
	useEffect(() => {
		if (initialized.current) {
			updateGraph();
		} else {

			initialize();
			initialized.current = true;
		}
		// eslint-disable-next-line
	}, [props.content])

	// Coatcisa
	let dotY = (radius, theta) => radius * Math.sin(theta);
	// Abtusa
	let dotX = (radius, theta) => radius * Math.cos(theta);

	// Degrees to Radians
	// eslint-disable-next-line
	let deg2rad = deg => deg * Math.PI / 180;
	// Radians to Degrees
	let rad2deg = rad => rad * 180 / Math.PI;

	let hypotneous = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

	let getTheta = (x, y) => {
		if (x >= 0 && y >= 0) return Math.atan(Math.abs(y / x))
		else if (x <= 0 && y >= 0) return Math.atan(Math.abs(y / x)) + Math.PI;
		else if (x <= 0 && y <= 0) return Math.atan(Math.abs(y / x)) + 2 * Math.PI;
		else if (x >= 0 && y <= 0) return Math.atan(Math.abs(y / x)) + 3 * Math.PI;
		return 0
	}

	function getSvgArcPath(cx, cy, radius, startAngle, endAngle) {
		var largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
		startAngle *= Math.PI / 180;
		endAngle *= Math.PI / 180;
		var x1 = cx + radius * Math.cos(endAngle);
		var y1 = cy + radius * Math.sin(endAngle);
		var x2 = cx + radius * Math.cos(startAngle);
		var y2 = cy + radius * Math.sin(startAngle);
		return "M " + x1 + " " + y1 + " A " + radius + " " + radius + " 0 " + largeArcFlag + " 0 " + x2 + " " + y2;
	}

	function translateWheelAngle(props, angle, invert) {
		var wheelAngle = props.wheelAngle;
		var wheelDirection = props.wheelDirection;

		if (!invert && wheelDirection === 'clockwise' || invert && wheelDirection === 'anticlockwise') {
			angle = (invert ? 180 : 360) - (wheelAngle - angle);
		} else {
			angle = wheelAngle + angle;
		} // javascript's modulo operator doesn't produce positive numbers with negative input
		// https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e


		return (angle % 360 + 360) % 360;
	}

	// Draw the circumfrence of the graph.
	let drawCircumference = (dial) => {
		dial.append('circle')
			.style('fill', 'url(#testGradient2)')
			.style('stroke', 'black')
			.style('stroke-width', 1.5)
			.style('stroke-opacity', 1)
			.attr('r', CHART_R)
	}
	// Draw the one standard deviation circle.
	let drawOneStd = (dial) => {

		dimension.theta.forEach((data, i) => {
			dial.append('circle')
				.style('fill', 'none')
				.style('stroke', 'black')
				.style('stroke-width', 1)
				.style('stroke-opacity', 1)
				.attr('r', CHART_R * dimension.normalize[i](1))

		})
	}

	// draw ancers 
	let drawAnchors = (dial) => {

		dial.selectAll()
			.append('g')
			.data(dimension.anchor)
			.enter()
			.append('circle')
			.attr('cx', d => d.x)
			.attr('cy', d => d.y)
			.attr('r', 2.5)
			.style('fill', 'red')
			.style('stroke', '#000')
			.style('stroke-width', 1.5)
	}

	// Print Lables
	let printLabels = (dial) =>
		dial.selectAll()
			.append('g')
			.data(dimension.hemi)
			.enter()
			.append('text')
			.append('textPath')
			.attr('xlink:href', (_, i) => `#labelPath${i}`)
			.attr('startOffset', d => d === HEMI_TOP ? '0%' : '100%')
			.style('font-family', 'sans-serif')
			.style('font-size', '24px')
			.style('font-weight', '500')
			.style('text-anchor', d => d === HEMI_TOP ? 'start' : 'end')
			.style('fill', 'red')
			.style('fill-opacity', 1)
			.style('cursor', 'default')
			.text((_, i) => props.labels[dimension.label[i]])

	// Plot data points
	let drawDots = (dial, dotData) => {
		dial.selectAll()
			.data(dotData)
			.enter()
			.append('path')
			.attr('id', (_, i) => `dot${i}`)
			.attr('d', symbol().type(symbolCircle).size(20))
			.attr('transform', d => 'translate(' + d.coordinates.x + ', ' + d.coordinates.y + ')')
			.style('fill', d => d.fill)
			.style('fill-opacity', 0.9)
			.style('stroke', '#000')
			.style('stroke-width', 0.1)
	}


	let zoomDots = (dots) => {
		// calculate maximum radius of any point on the graph.
		let maximumRadius = (() => {
			let _max_radius = 0;
			dots.forEach(row => {
				if (hypotneous(row.coordinates.x, row.coordinates.y) > _max_radius) {
					_max_radius = hypotneous(row.coordinates.x, row.coordinates.y);
				}
			})
			return _max_radius;
		})();

		// // Scale each data point by Scale
		dots.forEach(row => {
			row.coordinates.x *= (CHART_R - BORDER_BUFF) / maximumRadius;
			row.coordinates.y *= (CHART_R - BORDER_BUFF) / maximumRadius;
		})
	}

	let dotData = (row) => {

		// RadViz
		let x = 0;
		let y = 0;
		let xMax = 0;
		let yMax = 0;
		const point = { x: 0, y: 0, angel: 0, radius: 0 };
		let sumUnits = 0;

		console.log(row)
		dimension.theta.forEach((angle, i) => {

			// Unit is the HYPOTNEOUS of the datapoint.
			// it is scaled to the right proportions using Radius of the chart.

			// const radiusOfPoint = (row[dimension.label[i]] == 0) ? 0 : CHART_R * dimension.normalize[i](row[dimension.label[i]])
			const radiusOfPoint = CHART_R * dimension.normalize[i](row[dimension.label[i]])
			// console.log('Lables: ', dimension.label[i])
			// console.log('Value: ', row[dimension.label[i]])
			// console.log('Value scaled: ', dimension.normalize[i](row[dimension.label[i]]))
			// console.log('Radius: ', radiusOfPoint)
			if (radiusOfPoint !== 0) {
				// Mapping Polar to Cartesian.
				x += dotX(radiusOfPoint, angle);
				y += dotY(radiusOfPoint, angle);
				// eslint-disable-next-line
				sumUnits += radiusOfPoint
			}
			console.log(x, '---', y)
		})


		// console.log(dimension.theta)
		// console.log(rad2deg(getTheta(x, y)))

		// IM NOT SCALING IT!!!!!
		let scaling = CHART_R / sumUnits;
		// let scaling = 1;

		point.x = scaling * x;
		point.y = scaling * y;
		point.angel = Math.atan(y / x);
		point.radius = hypotneous(x, y) / CHART_R;


		// --- Get the max possible point on this angle. --- ALL OF THIS CODE IS 
		// Angle of the point
		// let theta = Math.atan(Math.abs(y / x));

		// Calucate the theoretical max of a point with this angle
		// let maxX = dotX(CHART_R, theta);
		// let maxY = dotY(CHART_R, theta);

		// newRadius / CHART_R = oldRadius / theorieticalMax_R
		// let newRadius = CHART_R * hypotneous(point.x, point.y) / hypotneous(maxX, maxY);

		// When calucalting the angle, the hemi of the point gets lost in the porcess.
		// This restores the correct posiiton of the datapoint.
		// point.x = dotX(newRadius, point.x < 0 ? theta + Math.PI : theta);
		// point.y = dotY(newRadius, point.y < 0 ? theta + Math.PI : theta);


		return {
			row: row,
			fill: dotPalette(row[props.colorAccessor]),
			coordinates: point
		}
	}

	// normalizeScale is a function that is going to create
	// a scale function for each data attribute
	// Such as [min, max] -> [0, 1]
	// Other datatypes such as boolean and comparable objects are supported.
	let normalizeScale = (dataType, dataArray) => {
		console.log(extent(dataArray))
		if (dataType === 'number')
			// return (max(dataArray) == 0) ? ((val)=> 0) : scaleLinear().domain(extent(dataArray)).range([0, 1])
			return scaleLinear().domain(extent(dataArray)).range([0, 1])

		if (dataType === 'boolean')
			return scaleLinear().domain([false, true]).range([0, 1])

		if (dataType === 'object') // It is 'date' type look in autoType from d3-dsv.js 
			return scaleLinear().domain(extent(dataArray)).range([0, 1])

		// Unsupported data type => using a string scale too
		let _array = Array.from(new Set(dataArray))
		_array.sort()
		return scaleThreshold().domain(_array).range(range(0, 1 + EPSILON, 1 / _array.length))
	};

	function initialize() {

		const svg = select('.canvas')
			.append('svg')
			// .attr('viewBox', `0 0 480 480`);
			.attr('viewBox', `-1000 -1000 2000 2000`);

		svg.append('defs')

		colorInCircumfrence();

		const dialRV = svg.append('g')
			.attr('id', 'dataWheel')
			.attr('transform', `translate(${[MARGIN + CHART_R, MARGIN + CHART_R]})`)

		drawCircumference(dialRV);
	}

	// Setting saturation and hsl
	function colorInCircumfrence() {

		const svg = select('.canvas')
			.select('svg')


		const g = svg.append('g')
			.attr('id', "hueWheel")
			.attr('stroke-width', CHART_R)

		{
			HUE_STEPS.forEach(angle => (
				g.append('path')
					.attr('key', { angle })
					.attr('d', getSvgArcPath(CHART_R + MARGIN, CHART_R + MARGIN, CHART_R / 2, angle, angle + 1.5))
					.attr('stroke', `hsl(${angle}, 100%, 50%)`)
			))
		}

		svg.append('circle')
			.attr('cx', CHART_R + MARGIN)
			.attr('cy', CHART_R + MARGIN)
			.attr('r', CHART_R)
			.style('fill', 'url(#saturation)')

		let defs = svg.select('defs')

		let saturation = defs.append('radialGradient')
			.attr('id', 'saturation')

		saturation.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#fff')
		saturation.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', '#fff')
			.attr('stop-opacity', 0)

	}

	async function updateGraph() {

		// Data Variable/
		let data = props.content;

		// variable used to access column data.
		let label = Object.keys(props.labels);

		// Creates a mapping, from [0, 4] to [-PI/2, PI], basically saying the type of angle that a point will have.
		let thetaDomain = [-Math.PI / 2 + EPSILON, 3 * Math.PI / 2];
		theta = scaleLinear().domain([0, label.length]).range(thetaDomain);

		// Creates a mapping of [-PI / 2, 3PI / 2], to [0, 1, 1, 0]
		let hemisphere = scaleQuantize().domain(thetaDomain).range([HEMI_TOP, HEMI_BOTTOM, HEMI_BOTTOM, HEMI_TOP]);

		// label     - the text assisiated with each dimention.
		// theta     - the angels (in radians) of each of the  lables [-1.5, 0, 1.5, 3.14].
		// hemi      - the TOP / BOTTOM hemisphear [0, 1, 1, 0].
		// anchor    - the (x, y) location of the text [{x: 0, y: -200}, {}, {}, {}].
		// normalize - createing a domain-range function to normalize everything to have [0, 1] range.
		dimension = (() => {
			const dim = { "label": label, "theta": [], "hemi": [], "anchor": [], "normalize": [] }
			label.forEach((d, i) => {
				const radian = theta(i)
				dim.theta.push(radian)
				dim.hemi.push(hemisphere(radian))
				dim.anchor.push({ x: dotX(CHART_R, radian), y: dotY(CHART_R, radian) })
				dim.normalize.push(normalizeScale(typeof data[0][d], data.map(_array => _array[d])))
			})
			return dim;
		})();

		// Radius of labels is going to be bigger Chart Radius because labels have to be outside.
		let LABEL_OFFSET = [12, 28];
		let labelR = (theta) => (CHART_R + LABEL_OFFSET[hemisphere(theta)]);

		// Creating Text paths for Labels.
		let textPath = (() => {
			const tpath = []

			dimension.label.forEach((d, i) => {

				// Next dimension on circumference:
				let j = i === dimension.label.length - 1 ? 0 : i + 1
				const arc = {}

				if (dimension.hemi[i] === HEMI_TOP) {
					arc.startAngle = theta(i)
					arc.endAngle = theta(j)
					arc.angle = Math.abs(rad2deg(arc.endAngle - arc.startAngle))
					arc.sweep = 1 // clockwised
					arc.r = labelR(arc.startAngle)
				} else {
					arc.startAngle = theta(j)
					arc.endAngle = theta(i)
					arc.angle = rad2deg(arc.startAngle - arc.endAngle)
					arc.sweep = 0 // counterclowised
					arc.r = labelR(arc.endAngle)
				}

				arc.point = {
					start: [dotX(arc.r, arc.startAngle), dotY(arc.r, arc.startAngle)],
					end: [dotX(arc.r, arc.endAngle), dotY(arc.r, arc.endAngle)]
				}

				tpath.push(`M${arc.point.start}A${[arc.r, arc.r]} ${arc.angle} 0 ${arc.sweep} ${arc.point.end}`)
			})

			return tpath
		})();

		let svg = select('.canvas').select('svg');

		let defs = select('defs')

		console.log(textPath)
		// Define hidden trajectories of labels
		defs.selectAll('g')
			.append('g')
			.data(textPath)
			.enter()
			.append('path')
			.attr('id', (_, i) => `labelPath${i}`)
			.attr('d', d => d)

		// const dialRV = svg.select('g');
		const dialRV = svg.select('#dataWheel');

		// Dots object that has coordinates for each data point
		let dots = (() => {
			const _dot = [];
			data.forEach(row => { _dot.push(dotData(row)) })
			return _dot;
		})();

		// fill up the whole space
		zoomDots(dots)

		// drawOneStd(dialRV)

		// drawAnchors(dialRV);

		printLabels(dialRV);

		drawDots(dialRV, dots);
	}

	return (
		<div className='canvas' />
	);
}

export default RadvizD3;
