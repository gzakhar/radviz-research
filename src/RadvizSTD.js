import { select } from 'd3-selection';
import { zoom, ZoomTransform } from 'd3-zoom';
import React, { useEffect, useState } from 'react';
import { segmentIntersectCircle, round, dotX, dotY, adjustedAnchorAngle, rad2deg, getTheta } from './RawPositioningMuellerVizSTD'

const BORDER_COLOR = '#DDDDDD';
const CHART_R = 200;

function Radviz(props) {

	const [transform, setTransform] = useState(new ZoomTransform(1, 0, 0))

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
							drawShadeStd(dataWheel, 0, props.std1);
							break;
							case 'one2two':
							drawShadeStd(dataWheel, props.std1, props.std2);
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
		drawCurtain(outline, 1, 2)

		// anchor, labels
		svg.select('#staticWheel').remove()
		const staticWheel = svg.append('g')
			.attr('id', 'staticWheel')

		if (props.labels) {
			let newLabels = anchorIntercept(props.labels, scale)
			drawAnchors(staticWheel, newLabels);
			printLabels(staticWheel, newLabels, defs);
		}

	}, [transform, props])


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
				radius = CHART_R + 27.5
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
	 * 
	 * Explenation: 
	 * 		This function adjusts the locations of the labels based 
	 * 		on the position of the observable graphic raltive to the real graphic.
	 * 		It does so by keeping track of where the "Real" graphic is realtive 
	 * 		to the "Observable" graphic. 
	 */
	function anchorIntercept(labels, transform) {
		let newLabels = []
		for (let label of labels) {
			// console.log(label)
			let r = transform.k

			// Finding the position of the Real graphic's center. Scaling 
			// transformation by the Chart Radius. to get it to base 1.
			let centerOfRealGraphicX = transform.x / CHART_R
			let centerOfRealGraphicY = transform.y / CHART_R
			// console.log('centerOfRealGraphicX: ', centerOfRealGraphicX)

			// Finding the position of the Observable graphic's center. Scaling
			// by the scale of transformation, and moving in opposite direction of movement.
			let centerObervableGraphicX = -centerOfRealGraphicX / r
			let centerObervableGraphicY = -centerOfRealGraphicY / r
			// console.log('centerObervableGraphicX: ', centerObervableGraphicX)

			// Getting positions of the label relative to the Real graphic.
			let pointXofRealGraphic = dotX(1, label.angle)
			let pointYofRealGraphic = dotY(1, label.angle)
			// console.log('pointXofMainGraphic: ', pointXofMainGraphic)

			// Calculating dx, dy of the Real graphic's label's coordinates relative to 
			// Observable graphic.
			let dX = pointXofRealGraphic - centerObervableGraphicX
			let dY = pointYofRealGraphic - centerObervableGraphicY
			// console.log('dX: ', dX)

			// Calculating new angle of lables relative to the Observable graphic.
			let angle = getTheta(dX, dY)
			// console.log('angle: ', rad2deg(angle))

			newLabels.push({ ...label, 'angle': angle })
		}
		return newLabels
	}


	return (
		<svg viewBox='-250 -250 500 500' />
	)
}

export default Radviz;