import { select } from 'd3-selection';
import React, { useEffect } from 'react';

const BORDER_COLOR = '#DDDDDD';
const CHART_R = 200;
const MARGIN = 50;

function Radviz(props) {

	useEffect(() => {

		let svg = select('svg')
		svg.select('defs').remove()
		let defs = svg.append('defs')

		colorInCircumfrence(svg, defs)

		svg.select('#dataWheel').remove()
		const dialRV = svg.append('g')
			.attr('id', 'dataWheel')
			.attr('transform', `translate(${[MARGIN + CHART_R, MARGIN + CHART_R]})`)



		if (props.shade) {
			for (const [key, value] of Object.entries(props.shade)) {
				if (!value) {
					switch (key) {
						case 'z2one':
							drawShadeStd(dialRV, 0, props.std);
							break;
						case 'one2two':
							drawShadeStd(dialRV, props.std, props.std2);
							break;
						case 'two2three':
							drawShadeStd(dialRV, props.std2, props.std3);
							break;
						case 'three2inf':
							drawShadeStd(dialRV, props.std3, 1);
							break;
					}
				}
			}
		}

		if (props.labels) {
			drawAnchors(dialRV, props.labels);
			printLabels(dialRV, props.labels, defs);
		}

		if (props.std) {
			drawStd(dialRV, props.std);
		}

		if (props.std2) {
			drawStd(dialRV, props.std2);
		}

		if (props.std3) {
			drawStd(dialRV, props.std3);
		}

		if (props.points) {
			drawDots(dialRV, props.points);
		}
	})


	let dotY = (radius, theta) => radius * Math.sin(theta);
	let dotX = (radius, theta) => radius * Math.cos(theta);


	// Print Labels
	function printLabels(dial, labels, defs) {

		let arcs = []
		for (let label of labels) {

			let top = (label.angle > Math.PI) ? true : false;
			let startAngle
			let endAngle
			let radius

			// TODO: figure out how to make the radius variable (size of label)
			if (top) {
				startAngle = label.angle - Math.PI / 4
				endAngle = label.angle + Math.PI / 4
				radius = CHART_R + 10
			} else {
				startAngle = label.angle + Math.PI / 4
				endAngle = label.angle - Math.PI / 4
				radius = CHART_R + 25
			}

			arcs.push(`M${[dotX(radius, startAngle), dotY(radius, startAngle)]} A${[radius, radius]} 0 0 ${top ? 1 : 0} ${[dotX(radius, endAngle), dotY(radius, endAngle)]}`)
		}

		defs.selectAll('g')
			.append('g')
			.data(arcs)
			.enter()
			.append('path')
			.attr('id', (_, i) => `labelPath${i}`)
			.attr('d', d => d);

		dial.selectAll()
			.append('g')
			.data(labels)
			.enter()
			.append('text')
			.attr('text-anchor', 'middle')
			.append('textPath')
			.attr('xlink:href', (_, i) => `#labelPath${i}`)
			.attr('startOffset', '50%')
			.style('font-family', 'sans-serif')
			.style('font-size', '24px')
			.style('font-weight', '600')
			.style('fill-opacity', 1)
			.style('cursor', 'default')
			.text((d) => d.anchor)
			.attr('id', 'anchor-labels')

	}

	// Draw anchors 
	function drawAnchors(dial, labels) {

		dial.selectAll('g').remove()

		dial.selectAll()
			.append('g')
			.data(labels)
			.enter()
			.append('circle')
			.attr('cx', d => dotX(CHART_R, d.angle))
			.attr('cy', d => dotY(CHART_R, d.angle))
			.attr('r', 5)
			.style('fill', 'red')
			.style('stroke', '#000')
			.style('stroke-width', 1.5)
	}

	// Plot data points
	function drawDots(dial, dotData) {

		let BORDER_MARGIN = 10

		dial.selectAll()
			.data(dotData)
			.enter()
			.append('circle')
			.attr('cx', d => (CHART_R - BORDER_MARGIN) * d.coordinates.x)
			.attr('cy', d => (CHART_R - BORDER_MARGIN) * d.coordinates.y)
			.attr('r', d => {
				if (d.data['county_name'] == props.hoverId) {
					return 10
				}
				return 2.5
			})
			.attr('id', (_, i) => `dot${i}`)
			.style('fill', '#000000')
			.style('fill-opacity', 0.8)
			.style('stroke', '#FFFFFF')
			.style('stroke-width', 0.1)
			.on('mouseover', handleHoverOn)
			.on('mouseout', handleHoverOff)
	}

	function handleHoverOn(i, d) {

		// TODO: change to the same name as the APP.js
		props.hoverOver(d.data['county_name'])


		// TODO make the id of dot labels more unique
		select(this.parentNode).append('text')
			.attr('id', "dot-labels")
			.attr('x', this.getAttribute('cx') - 10)
			.attr('y', this.getAttribute('cy') - 10)
			.text(d.textFloater)

	}

	function handleHoverOff(i, d) {

		props.hoverOver(-1)


		// TODO make the id of dot labels more unique
		select(this.parentNode).select("#dot-labels")
			.remove()
	}


	// Setting saturation and hsl
	function colorInCircumfrence(svg, defs) {

		const HUE_STEPS = Array.apply(null, { length: 360 }).map((_, index) => index);

		// remove if refreshed
		svg.select('#hueWheel').remove()

		const g = svg.append('g')
			.attr('id', "hueWheel")
			.attr('stroke-width', CHART_R)


		HUE_STEPS.forEach(angle => (
			g.append('path')
				.attr('key', angle)
				.attr('d', getSvgArcPath(CHART_R + MARGIN, CHART_R + MARGIN, CHART_R / 2, angle, angle + 1.5))
				.attr('stroke', `hsl(${angle}, 100%, 50%)`)
		))


		svg.selectAll("circle").remove()

		svg.append('circle')
			.attr('cx', CHART_R + MARGIN)
			.attr('cy', CHART_R + MARGIN)
			.attr('r', CHART_R)
			.style('fill', 'url(#saturation)')

		let saturation = defs.append('radialGradient')
			.attr('id', 'saturation')

		saturation.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#fff')
		saturation.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', '#fff')
			.attr('stop-opacity', 0)

		svg.append('circle')
			.style('fill', 'none')
			.style('stroke', BORDER_COLOR)
			.style('stroke-width', 3)
			.style('stroke-opacity', 1)
			.attr('cx', CHART_R + MARGIN)
			.attr('cy', CHART_R + MARGIN)
			.attr('r', CHART_R)

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

	function drawStd(dial, std) {

		dial.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', std * CHART_R)
			.style('fill', 'none')
			.style('stroke', '#313131')
			.style('stroke-width', 3)
			.style('stroke-dasharray', '2, 5')
			.style('stroke-opacity', 1)
		// .style('cursor', 'pointer')


		dial.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', std * CHART_R)
			.style('fill', 'none')
			.style('stroke', '#DDDDDD')
			.style('stroke-width', 3)
			.style('stroke-dasharray', '5, 2')
			.style('stroke-dashoffset', 5)
			.style('stroke-opacity', 1)
		// .style('cursor', 'pointer')
		// .on('mouseover', () => console.log('hover'))
	}

	function drawShadeStd(dial, innerRadius, outerRadius) {

		let smallArcRadius = innerRadius * CHART_R
		let largeArcRadius = outerRadius * CHART_R

		// two arc paths that work togeather to create a donut.
		dial.append('path')
			.attr('d', `M 0 0 
					m ${-largeArcRadius} 0 
					a 1 1 0 0 1 ${2 * largeArcRadius} 0
					l ${-(largeArcRadius - smallArcRadius)} 0 
					a 1 1 0 0 0 ${-(2 * smallArcRadius)} 0 
					l ${-(largeArcRadius - smallArcRadius)} 0 
					M 0 0
					m ${-largeArcRadius} 0 
					a 1 1 0 0 0 ${2 * largeArcRadius} 0
					l ${-(largeArcRadius - smallArcRadius)} 0 
					a 1 1 0 0 1 ${-(2 * smallArcRadius)} 0 
					l ${-(largeArcRadius - smallArcRadius)} 0 
					Z`)
			.style('stroke', 'none')
			.style('fill', 'gray')
			.style('opacity', '0.5')

	}

	return (
		<svg viewBox='0 0 500 500' />
	)
}



export default Radviz;