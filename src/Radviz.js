import { select } from 'd3-selection';
import React, { useEffect } from 'react';

function Radviz(props) {

	let CHART_R = 200
	let MARGIN = 10

	useEffect(() => {

		let svg = select('svg')

		colorInCircumfrence(svg)

		svg.select('#dataWheel').remove()
		const dialRV = svg.append('g')
			.attr('id', 'dataWheel')
			.attr('transform', `translate(${[MARGIN + CHART_R, MARGIN + CHART_R]})`)

		if (props.points) {
			drawDots(dialRV, props.points);
		}
	})

	return (
		<svg viewBox='0 0 480 480' />
	)
}

// Plot data points
let drawDots = (dial, dotData) => {

	dial.selectAll()
		.data(dotData)
		.enter()
		.append('circle')
		.attr('cx', d => 200 * d.coordinates.x)
		.attr('cy', d => 200 * d.coordinates.y)
		.attr('r', 2.5)
		.attr('id', (_, i) => `dot${i}`)
		.style('fill', d => d.fill)
		.style('fill-opacity', 0.9)
		.style('stroke', '#000')
		.style('stroke-width', 0.1)
	// .on('mouseover', handleHoverOn)
	// .on('mouseout', handleHoverOff)
	// .on('click', props.handleMouseClick)
}


// Setting saturation and hsl
function colorInCircumfrence(svg) {

	let CHART_R = 200
	let MARGIN = 10
	const HUE_STEPS = Array.apply(null, { length: 360 }).map((_, index) => index);

	svg.select('#hueWheel').remove()

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

	svg.select('circle').remove()

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

	function getSvgArcPath(cx, cy, radius, startAngle, endAngle) {
		var largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
		startAngle *= Math.PI / 180;
		endAngle *= Math.PI / 180;
		var x1 = cx + radius * Math.cos(endAngle);
		var y1 = cy + radius * Math.sin(endAngle);
		var x2 = cx + radius * Math.cos(startAngle);
		var y2 = cy + radius * Math.sin(startAngle);

		return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`;
	}
}

export default Radviz;