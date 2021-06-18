import React, { useEffect } from 'react';
import { select } from 'd3-selection';


function CircleD3(props) {


	useEffect(() => {
		let svg = select('.canvas').append('svg').attr('viewBox', '-250 -250 500 500');

		// svg.append('rect')
		// 	.attr('x', -200)
		// 	.attr('y', -200)
		// 	.attr('width', 400)
		// 	.attr('height', 400)
		// 	.style('fill', 'url(#linearColor4)')

		svg.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 200)
			.style('fill', 'url(#linearColor1)')

		svg.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 200)
			.style('fill', 'url(#linearColor2)')

		svg.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 200)
			.style('fill', 'url(#linearColor3)')

		svg.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 200)
			.style('fill', 'url(#linearColor4)')


		let defs = svg.append('defs')

		let green = defs.append('linearGradient')
			.attr('id', 'linearColor1')
			.attr('x1', '1')
			.attr('y1', '1')
			.attr('x2', '0')
			.attr('y2', '0')

		green.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#01E400')
			.attr('stop-opacity', 1)
		green.append('stop')
			.attr('offset', '75%')
			.attr('stop-color', '#fff')
			.attr('stop-opacity', 0)


		let yellow = defs.append('linearGradient')
			.attr('id', 'linearColor2')
			.attr('x1', '0')
			.attr('y1', '1')
			.attr('x2', '1')
			.attr('y2', '0')

		yellow.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#FEFF01')
			.attr('stop-opacity', 1)
		yellow.append('stop')
			.attr('offset', '75%')
			.attr('stop-color', '#fff')
			.attr('stop-opacity', 0)


		let red = defs.append('linearGradient')
			.attr('id', 'linearColor3')
			.attr('x1', '1')
			.attr('y1', '0')
			.attr('x2', '0')
			.attr('y2', '1')

		red.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#FB0300')
			.attr('stop-opacity', 1)
		red.append('stop')
			.attr('offset', '75%')
			.attr('stop-color', '#fff')
			.attr('stop-opacity', 0)


		let blue = defs.append('linearGradient')
			.attr('gradientUnits', [])
			.attr('id', 'linearColor4')
			.attr('x1', '0')
			.attr('y1', '0')
			.attr('x2', '1')
			.attr('y2', '1')

		blue.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', 'blue')
			.attr('stop-opacity', 1)
		blue.append('stop')
			.attr('offset', '75%')
			.attr('stop-color', '#fff')
			.attr('stop-opacity', 0)

		// green.append('stop')
		// 	.attr('offset', '25%')
		// 	.attr('stop-color', '#FEFF01')
		// // green.append('stop')
		// 	.attr('offset', '40%')
		// 	.attr('stop-color', '#FF7E00')
		// green.append('stop')
		// 	.attr('offset', '60%')
		// 	.attr('stop-color', '#FB0300')
		// green.append('stop')
		// 	.attr('offset', '80%')
		// 	.attr('stop-color', '#9B004A')
		// green.append('stop')
		// 	.attr('offset', '100%')
		// 	.attr('stop-color', '#7D0022')
	})





	return (
		<div className='canvas' />
	)
}

export default CircleD3;