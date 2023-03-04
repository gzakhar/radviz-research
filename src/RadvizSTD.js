import { select } from 'd3-selection';
import { zoom, ZoomTransform } from 'd3-zoom';
import React, { useEffect, useState, useRef } from 'react';
import { dotX, dotY, getTheta, hypotneous } from './RawPositioningMuellerVizSTD'
import { v4 as uuid } from 'uuid';

const BORDER_COLOR = '#DDDDDD';
const BORDER_BOUNDRY = 15;
const CHART_R = 200;
const DOT_R = 3;
const DOT_COLOR = "#000000";
const DOT_BORDER_COLOR = "#FFFFFF";
const HUE_ACCURACY = 400;
const CURTAIN_COLOR = "#313131"
const LABEL_COLOR = "#c4f800"

function Radviz(props) {

	const [transform, setTransform] = useState(new ZoomTransform(1, 0, 0));
	const svgRef = useRef(null);

	useEffect(() => {
		// #1 svg.
		let svg = select(svgRef.current)

		svg.select('defs').remove()
		let defs = svg.append('defs')

		svg.call(zoom()
			.scaleExtent([1, 100])
			.on("zoom", (e) => {
				let t = movementBoundry(e.transform)
				setTransform(t)
				svgRef.current.__zoom = t
			}));

		// #2 hueWheel, datawheel, border, reactive, data, curtain, anchors, labels
		svg.select('#zoomLayer').remove()

		let zoomLayer = svg.append('g')
			.attr('id', 'zoomLayer')
			.attr("transform", transform)

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
							drawShadeStd(dataWheel, props.std3, CHART_R);
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
			let newLabels = anchorIntercept(props.labels, transform)
			drawAnchors(staticWheel, newLabels);
			printLabels(staticWheel, newLabels, defs);
		}

	}, [transform, props])


	// Print Labels
	function printLabels(dial, labels, defs) {

		let arcPaths = []
		for (let label of labels) {

			let top = (label.angle > Math.PI) ? true : false;
			let startAngle
			let endAngle
			let radius

			// TODO: figure out how to make the radius variable (size of label)
			if (top) {
				startAngle = label.angle - Math.PI / 4
				endAngle = label.angle + Math.PI / 4
				radius = CHART_R + 10 + BORDER_BOUNDRY
			} else {
				startAngle = label.angle + Math.PI / 4
				endAngle = label.angle - Math.PI / 4
				radius = CHART_R + 27.5 + BORDER_BOUNDRY
			}

			arcPaths.push(
				{
					"label": label,
					"path": `M${[dotX(radius, startAngle), dotY(radius, startAngle)]} A${[radius, radius]} 0 0 ${top ? 1 : 0} ${[dotX(radius, endAngle), dotY(radius, endAngle)]}`,
					"uuid": uuid()
				}
			)
		}

		defs.selectAll('g')
			.append('g')
			.data(arcPaths)
			.enter()
			.append('path')
			.attr('id', d => d.uuid)
			.attr('d', d => d.path);


		dial.selectAll()
			.append('g')
			.data(arcPaths)
			.enter()
			.append('text')
			.attr('text-anchor', 'middle')
			.append('textPath')
			.attr('xlink:href', d => `#${d.uuid}`)
			.attr('startOffset', '50%')
			.style('font-family', 'sans-serif')
			.style('font-size', '24px')
			.style('font-weight', '600')
			.style('fill-opacity', 1)
			.style('cursor', 'pointer')
			.text((d) => d.label.anchor.toUpperCase())
			.attr('id', 'anchor-labels')
			.style('fill', LABEL_COLOR)

	}

	// Draw anchors 
	function drawAnchors(dial, labels) {

		dial.selectAll('g').remove()

		dial.selectAll()
			.append('g')
			.data(labels)
			.enter()
			.append('circle')
			.attr('cx', d => dotX(CHART_R + BORDER_BOUNDRY, d.angle))
			.attr('cy', d => dotY(CHART_R + BORDER_BOUNDRY, d.angle))
			.attr('r', 5)
			.style('fill', 'red')
			.style('stroke', '#000')
			.style('stroke-width', 1.5)
	}

	// Plot data points
	function drawDots(dial, dotData, scale) {

		dial.selectAll()
			.data(dotData)
			.enter()
			.append('circle')
			.attr('cx', d => CHART_R * d.coordinates.x)
			.attr('cy', d => CHART_R * d.coordinates.y)
			.attr('r', d => {
				if (d.data['county_name'] == props.hoverId) {
					return DOT_R * 2 / scale
				}
				return DOT_R / scale
			})
			.attr('id', (_, i) => `dot${i}`)
			.style('fill', DOT_COLOR)
			.style('fill-opacity', 0.8)
			.style('stroke', DOT_BORDER_COLOR)
			.style('stroke-width', 0.1 / scale)
			.on('mouseover', handleHoverOn)
			.on('mouseout', handleHoverOff)
	}

	function handleHoverOn(i, d) {

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
	function colorInCircumfrence(parent, defs) {

		const ratio = 360 / HUE_ACCURACY;

		const HUE_STEPS = Array.apply(null, { length: HUE_ACCURACY }).map((_, index) => index * ratio);

		HUE_STEPS.forEach(angle => (
			parent.append('path')
				.attr('key', angle)
				.attr('d', getSvgArcPath(CHART_R + BORDER_BOUNDRY, angle))
				.attr('fill', `hsl(${angle}, 100%, 50%)`)
		))

		parent.selectAll("circle").remove()

		parent.append('circle')
			.attr('r', CHART_R + BORDER_BOUNDRY)
			.style('fill', 'url(#saturation)')

		let saturation = defs.append('radialGradient')
			.attr('id', 'saturation')

		saturation.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#CCC')
			.attr('stop-opacity', 1)
		saturation.append('stop')
			.attr('offset', '90%')
			.attr('stop-color', '#FFFFFF')
			.attr('stop-opacity', 0)

		function getSvgArcPath(radius, startAngle, offsetAngle = 90) {

			let a1 = (startAngle + offsetAngle) * Math.PI / 180;
			let a2 = (1.1 + startAngle + offsetAngle) * Math.PI / 180;

			var x1 = radius * Math.sin(a1);
			var y1 = - radius * Math.cos(a1);

			var x2 = radius * Math.sin(a2);
			var y2 = - radius * Math.cos(a2);

			return `M ${x1} ${y1}
					A ${radius} ${radius} 0 0 1 ${x2} ${y2}
					L 0 0 Z`
		}

	}

	function drawBorder(parent, borderColor = BORDER_COLOR) {

		const id = 'border'

		parent.select('#' + id).remove()

		parent.append('circle')
			.style('fill', 'none')
			.style('stroke', borderColor)
			.style('stroke-width', 3)
			.style('stroke-opacity', 1)
			.attr('r', CHART_R + BORDER_BOUNDRY)
			.attr('id', id)
	}


	function drawStd(dial, std, scale) {

		dial.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', std * CHART_R)
			.style('fill', 'none')
			.style('stroke', '#313131')
			.style('stroke-width', 1.5 / scale)
			.style('stroke-dasharray', '2, 5')
			.style('stroke-opacity', 1)

		dial.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', std * CHART_R)
			.style('fill', 'none')
			.style('stroke', '#DDDDDD')
			.style('stroke-width', 1.5 / scale)
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

		let smallArcRadius = innerRadius * CHART_R + BORDER_BOUNDRY
		let largeArcRadius = outerRadius * CHART_R + BORDER_BOUNDRY

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
			.style('stroke', 'solid')
			.style('fill', CURTAIN_COLOR)
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

	function movementBoundry(transform) {

		let r = transform.k
		let x = transform.x / CHART_R
		let y = transform.y / CHART_R

		let h = hypotneous(x, y)
		let angle = getTheta(x, y)

		return h < (r - 1) ? transform : new ZoomTransform(r, dotX((r - 1) * CHART_R, angle), dotY((r - 1) * CHART_R, angle))
	}

	return (
		<svg ref={svgRef} viewBox='-250 -250 500 500' style={{ borderRadius: '250px' }} />
	)
}

export default Radviz;