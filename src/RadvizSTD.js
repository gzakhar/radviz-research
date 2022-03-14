import { select } from 'd3-selection';
import { zoom, ZoomTransform } from 'd3-zoom';
import React, { useEffect, useState } from 'react';
import { segmentIntersectCircle, round,  dotX, dotY, adjustedAnchorAngle, rad2deg, getTheta } from './RawPositioningMuellerVizSTD'

const BORDER_COLOR = '#DDDDDD';
const CHART_R = 200;
const MARGIN = 50;

function Radviz(props) {

	const [transform, setTransform] = useState(new ZoomTransform(1, MARGIN + CHART_R, MARGIN + CHART_R))

	// Necessery to get the inital zoom for svg
	let t = document.getElementById('svg')
	if (t) t.__zoom = transform

	useEffect(() => {
		// #1 svg.
		let svg = select('svg').attr('id', 'svg')

		svg.select('defs').remove()
		let defs = svg.append('defs')

		svg.call(zoom()
			.scaleExtent([1, 10])
			.on("zoom", (e) => setTransform(e.transform)));

		// #2 hueWheel, datawheel, border, reactive, data, curtain, anchors, labels
		svg.select('#zoomLayer').remove()

		// let scale = transform.translate(MARGIN + CHART_R, MARGIN + CHART_R)
		let scale = transform
		let zoomLayer = svg.append('g')
			.attr('id', 'zoomLayer')
			.attr("transform", scale)


		// hueWheel.
		zoomLayer.select("#hueWheel").remove()
		let hueWheel = zoomLayer.append('g')
			.attr('id', 'hueWheel')
		colorInCircumfrence(hueWheel, defs)

		// dataWheel.
		zoomLayer.select('#dataWheel').remove()
		let dataWheel = zoomLayer.append('g')
			.attr('id', 'dataWheel')


		// border.
		drawBorder(svg)


		// reactive
		if (props.shade) {
			for (const [key, value] of Object.entries(props.shade)) {
				if (!value) {
					switch (key) {
						case 'z2one':
							drawShadeStd(dataWheel, 0, props.std);
							break;
						case 'one2two':
							drawShadeStd(dataWheel, props.std, props.std2);
							break;
						case 'two2three':
							drawShadeStd(dataWheel, props.std2, props.std3);
							break;
						case 'three2inf':
							drawShadeStd(dataWheel, props.std3, 1);
							break;
					}
				}
			}
		}
		if (props.std1) drawStd(dataWheel, props.std1, transform.k || 1);
		if (props.std2) drawStd(dataWheel, props.std2, transform.k || 1);
		if (props.std3) drawStd(dataWheel, props.std3, transform.k || 1);

		// data
		if (props.points) drawDots(dataWheel, props.points, transform.k || 1);


		// curtain
		svg.select('#curtain').remove()
		let outline = svg.append('g')
			.attr('id', 'curtain')
			.attr('transform', `translate(${[MARGIN + CHART_R, MARGIN + CHART_R]})`)
		drawCurtain(outline, 1, 2)

		// anchor, labels
		svg.select('#staticWheel').remove()
		const staticWheel = svg.append('g')
			.attr('id', 'staticWheel')
			.attr('transform', `translate(${[MARGIN + CHART_R, MARGIN + CHART_R]})`)

		if (props.labels) {
			anchorIntercept(props.labels, scale)
			drawAnchors(staticWheel, props.labels);
			printLabels(staticWheel, props.labels, defs);
		}

	}, [transform])


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
			.text((d) => d.anchor.toUpperCase())
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
	function drawDots(dial, dotData, scale) {

		let BORDER_MARGIN = 10

		dial.selectAll()
			.data(dotData)
			.enter()
			.append('circle')
			.attr('cx', d => (CHART_R - BORDER_MARGIN) * d.coordinates.x)
			.attr('cy', d => (CHART_R - BORDER_MARGIN) * d.coordinates.y)
			.attr('r', d => {
				if (d.data['county_name'] == props.hoverId) {
					return 10 / scale
				}
				return 3.0 / scale
			})
			.attr('id', (_, i) => `dot${i}`)
			.style('fill', '#000000')
			.style('fill-opacity', 0.8)
			.style('stroke', '#FFFFFF')
			.style('stroke-width', 0.1)
	}

	// Setting saturation and hsl
	function colorInCircumfrence(parent, defs) {

		const HUE_STEPS = Array.apply(null, { length: 360 }).map((_, index) => index);

		// element that should hold all the coloring.
		const g = parent.attr('stroke-width', CHART_R)

		HUE_STEPS.forEach(angle => (
			g.append('path')
				.attr('key', angle)
				.attr('d', getSvgArcPath(0, 0, CHART_R / 2, angle, angle + 1.5))
				.attr('stroke', `hsl(${angle}, 100%, 50%)`)
		))

		g.selectAll("circle").remove()

		g.append('circle')
			.attr('r', CHART_R)
			.style('fill', 'url(#saturation)')

		let saturation = defs.append('radialGradient')
			.attr('id', 'saturation')

		saturation.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#fff')
			.attr('stop-opacity', 1)
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

		return g
	}

	function drawBorder(parent, borderColor = BORDER_COLOR) {

		const id = 'border'

		parent.select('#' + id).remove()

		parent.append('circle')
			.style('fill', 'none')
			.style('stroke', borderColor)
			.style('stroke-width', 3)
			.style('stroke-opacity', 1)
			.attr('cx', CHART_R + MARGIN)
			.attr('cy', CHART_R + MARGIN)
			.attr('r', CHART_R)
			.attr('id', id)
	}


	function drawStd(dial, std, scale) {

		dial.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', std * CHART_R)
			.style('fill', 'none')
			.style('stroke', '#313131')
			.style('stroke-width', 3 / scale)
			.style('stroke-dasharray', '2, 5')
			.style('stroke-opacity', 1)

		dial.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', std * CHART_R)
			.style('fill', 'none')
			.style('stroke', '#DDDDDD')
			.style('stroke-width', 3 / scale)
			.style('stroke-dasharray', '5, 2')
			.style('stroke-dashoffset', 5)
			.style('stroke-opacity', 1)
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



	function drawCurtain(parent, innerRadius, outerRadius) {

		let smallArcRadius = innerRadius * CHART_R
		let largeArcRadius = outerRadius * CHART_R

		// two arc paths that work togeather to create a donut.
		parent.append('path')
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
			.attr('id', 'cutout')
			.style('stroke', 'none')
			.style('fill', '#313131')
			.style('opacity', '1')

	}


	/**
	 * Arguemnts:
	 * 		anchorPositions: props.labels
	 * 		transform: scale
	 */
	function anchorIntercept(labels, transform) {

		for (let label of labels) {

			// Label
			// console.log(label)
			// x2, y2
			// console.log(dotX(1, label.angle), dotY(1, label.angle))
			// x1, y1
			// console.log(transform.x/CHART_R, transform.y/CHART_R)
			// radius
			// console.log(1/transform.k)
			// let x1 = transform.x/CHART_R
			// let y1 = transform.y/CHART_R
			// let x2 = dotX(1, label.angle)
			// let y2 = dotY(1, label.angle)
			// let r = 1/transform.k
			// segmentIntersectCircle(x1, y1, x2, y2, x1, y1, r)
		}
		let label = labels[0]
		// console.log(label)
		let x1 = (transform.x / CHART_R) - 1.25
		let y1 = (transform.y / CHART_R) - 1.25
		let x2 = dotX(1, label.angle)
		let y2 = dotY(1, label.angle)
		let r = 1 / transform.k
		// console.log(round(x1, 4), round(y1, 4))
		console.log(rad2deg(getTheta(-10, 0)))
		// segmentIntersectCircle(x1, y1, x2, y2, x1, y1, r)
	}


	return (
		<svg viewBox='0 0 500 500' />
	)
}

export default Radviz;