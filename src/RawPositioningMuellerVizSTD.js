import { scaleLinear } from 'd3-scale';
import { std, mean } from 'mathjs';

const ROUND_TO = 10000

let dotY = (radius, theta) => radius * Math.sin(theta);
let dotX = (radius, theta) => radius * Math.cos(theta);
let deg2rad = deg => deg * Math.PI / 180;
let rad2deg = rad => rad * 180 / Math.PI;
let getTheta = (x, y) => {

	if (y < 0) {
		return 2 * Math.PI + Math.atan2(y, x);
	}
	return Math.atan2(y, x);
}
let hypotneous = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
let round = (number, roundTo) => Math.round(roundTo * number) / roundTo;
let slope = (x1, x2, y1, y2) => {
	if (Math.abs(x1 - x2) != 0) {
		return (y2 - y1) / (x2 - x1);
	}
	console.warn("ERROR: invalid slope");
	return null;
}

let yIntersect = (x, y, slope) => {
	if (slope === undefined) console.warn('slope undefined')
	return (y - (x * slope))
}

function adjustedAnchorAngle(xOffset, yOffset, xInit, yInit) {

	return Math.atan((yOffset - yInit) / (xOffset - xInit))

}


function segmentIntersectCircle(x1, y1, x2, y2, cx, cy, r) {

	console.log('x1: ', x1, '\ny1: ', y1, '\nx2: ', x2, '\ny2: ', y2, '\ncx: ', cx, '\ncy: ', cy, '\nr: ', r)

	let m = slope(x1, x2, y1, y2)
	let d = yIntersect(x1, y1, m)
	// console.log(m, d)
	let a = 1 + m * m
	let b = -2 * cx + 2 * m * d - 2 * cy * m
	let c = cx * cx + d * d - 2 * cy * d + cy * cy - r

	// console.log(a, b, c)
	let { root1, root2 } = quadratic(a, b, c)
	// console.log(root1, root2)
}

function quadratic(a, b, c) {

	// program to solve quadratic equation
	let root1, root2;

	// calculate discriminant
	let discriminant = b * b - 4 * a * c;

	// condition for real and different roots
	if (discriminant > 0) {
		root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
		root2 = (-b - Math.sqrt(discriminant)) / (2 * a);

		// result
		// console.log(`The roots of quadratic equation are ${root1} and ${root2}`);
	}

	// condition for real and equal roots
	else if (discriminant == 0) {
		root1 = root2 = -b / (2 * a);

		// result
		// console.log(`The roots of quadratic equation are ${root1} and ${root2}`);
	}

	// if roots are not real
	else {
		let realPart = (-b / (2 * a)).toFixed(2);
		let imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(2);

		// result
		console.warn(`The roots of quadratic equation are ${realPart} + ${imagPart}i and ${realPart} - ${imagPart}i`)
		root1 = realPart + imagPart
		root2 = realPart - imagPart
	}
	return { root1, root2 }
}

let mapRadvizpoint = (row, anchorInfo, normalization) => {

	let x = 0;
	let y = 0;
	let point = { x: 0, y: 0, angle: 0, radius: 0 };
	let sumUnits = 0;

	Object.keys(anchorInfo).forEach(anchor => {

		let pointRadius = normalization(row[anchor])
		if (pointRadius != 0) {

			let angle = anchorInfo[anchor].angle
			x += round(dotX(pointRadius, angle), ROUND_TO)
			y += round(dotY(pointRadius, angle), ROUND_TO)

			// sumUnits += pointRadius
			sumUnits = 0
		}
	})

	// console.log('norm: ', row)
	if (sumUnits != 0) {

		let scaling = 1 / sumUnits;
		// Radvix Scaling
		x = scaling * x;
		y = scaling * y;
		// console.log('radviz: ', [x, y])

	}

	// let angle = getTheta(x, y);
	// set points
	point.x = x;
	point.y = y;
	// point.angle = angle;
	// point.radius = hypotneous(x, y)

	return {
		data: row,
		coordinates: point
	}
}


function normalizeData(data, labels) {

	let dim = (() => {
		const stats = { label: [], mean: [], stddiv: [] }
		if (data.length != 0) {
			Object.keys(data[0]).forEach(d => {
				if (labels.includes(d)) {
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

	if (data.length != 0) {
		data.forEach(row => {
			dim.label.forEach(d => {
				let i = dim.label.indexOf(d)
				row[d] = (row[d] - dim.mean[i]) / dim.stddiv[i];
			})
		})
	}

}

function filterDataStdDiv(data, labels, stddiv) {

	data = data.filter(row => {
		for (let label of labels) {
			if (Math.abs(row[label]) >= stddiv) {
				return false
			}
			return true
		}
	})
	return data;
}

function findMaxOutliar(data, labels) {

	let maxOutliar = Number.MIN_SAFE_INTEGER
	// console.log(labels)

	data.forEach(row => {
		labels.forEach(label => {
			if (Math.abs(row[label]) > maxOutliar) {
				maxOutliar = Math.abs(row[label])
			}
		})
	})

	return maxOutliar;
}


function RawPositioning(data, labelTextMapping, labelAngleMapping, standardDeviation, standardDeviation2, standardDeviation3, textAccessor = null, zoom = true) {

	// TODO: order of labels is determined by the angles at which they are displayed.
	// let labels = Object.keys(labelTextMapping);
	// Sorted Array of labels.
	let labels = Object.keys(labelAngleMapping)
	labels.sort((f, s) => labelAngleMapping[f] - labelAngleMapping[s])
	// console.log('sorted-array-of-labels: ', labels)
	let numberOfAnchors = labels.length;

	// Mappings from label to angle of label
	let label2Theta = (label) => deg2rad(labelAngleMapping[label])
	let theta2Index = ((angle) => {
		for (let i = 0; i < labels.length - 1; i++) {
			let label = labels[i]
			let nextLabel = labels[i + 1]
			if (angle >= deg2rad(labelAngleMapping[label]) && angle < deg2rad(labelAngleMapping[nextLabel])) {
				return i
			}
		}
		return labels.length - 1
	})

	// initialize directory of anchor Information.
	let anchorInfo = (() => {
		let labelInfo = {}
		labels.forEach(label => {
			labelInfo[label] = { 'angle': label2Theta(label) }
		});
		return labelInfo;
	})();


	normalizeData(data, labels)

	let maxOutliar = findMaxOutliar(data, labels)

	// filtering data
	// data = filterDataStdDiv(data, labels, standardDeviation)

	// initialize Normalization Function.
	let normalizationFunction = scaleLinear().domain([-maxOutliar, maxOutliar]).range([-1, 1]);

	// map points onto radviz.
	let points = []
	data.forEach(e => {
		points.push(mapRadvizpoint(e, anchorInfo, normalizationFunction))
	});


	// initialized a dictionary of border functions.
	// let borderFunctionDict = (() => {
	// 	let func = {}
	// 	labels.forEach((label, i, labelsArray) => {

	// 		let angle = label2Theta(label);
	// 		let nextAngle = label2Theta((labelsArray[(i + 1) % numberOfAnchors]));

	// 		// y = ax + b
	// 		let a = slope(dotX(1, angle), dotX(1, nextAngle), dotY(1, angle), dotY(1, nextAngle));
	// 		let b = xIntersect(dotX(1, angle), dotY(1, angle), a);
	// 		let xIntersept = dotX(1, angle)

	// 		// if slope of border function is (effective) zero. 
	// 		if (Math.abs(round(a, 10000000)) === 0) {
	// 			func[i] = (theta) => {

	// 				let thetaRonded = round(theta, ROUND_TO)
	// 				// if tan(theta) undefined
	// 				if (thetaRonded == round(Math.PI / 2, ROUND_TO) || thetaRonded == round(3 * Math.PI / 2, ROUND_TO)) {
	// 					// find intersection with x = 0 and y=ax+b
	// 					return round(Math.abs(b), ROUND_TO)
	// 				}

	// 				// if not y = b
	// 				let a2 = Math.tan(theta)
	// 				let y = b
	// 				let x = round(y / a2, ROUND_TO)
	// 				return hypotneous(x, y)
	// 			}
	// 		}
	// 		// if slope of border function is (effective) undefined.
	// 		else if (a > 10000000) {
	// 			func[i] = (theta) => {

	// 				let a2 = Math.tan(theta)
	// 				let x = xIntersept
	// 				let y = a2 * x

	// 				return hypotneous(x, y)
	// 			}
	// 		}
	// 		// else border function is regular
	// 		else {
	// 			func[i] = (theta) => {

	// 				let thetaRonded = round(theta, ROUND_TO)
	// 				// if tan(theta) undefined
	// 				if (thetaRonded == round(Math.PI / 2, ROUND_TO) || thetaRonded == round(3 * Math.PI / 2, ROUND_TO)) {
	// 					// find intersection with x = 0 and y=ax+b
	// 					return round(Math.abs(b), ROUND_TO)
	// 				}

	// 				let a2 = Math.tan(theta)
	// 				let x = round(-b / (a - a2), ROUND_TO);
	// 				let y = round(a2 * x, ROUND_TO);

	// 				return hypotneous(x, y)
	// 			}
	// 		}
	// 	})
	// 	return func
	// })();


	// Not being used in Muller Viz
	// let borderFunctions = (angle) => borderFunctionDict[theta2Index(angle)](angle)
	// scaling by border functions
	// points = points.map((point) => {
	// 	let scaling = 1 / borderFunctions(getTheta(point.coordinates.x, point.coordinates.y));
	// 	const x = scaling * point.coordinates.x
	// 	const y = scaling * point.coordinates.y
	// 	const coordinates = { ...point.coordinates, x: x, y: y }
	// 	return { ...point, coordinates: coordinates }
	// })

	let result = {}

	if (zoom) {

		// get min and max of radius
		let minRadius = Number.MAX_SAFE_INTEGER
		let maxRadius = Number.MIN_SAFE_INTEGER
		points.forEach((point) => {
			const x = point.coordinates.x
			const y = point.coordinates.y
			const radius = hypotneous(x, y)
			if (minRadius > radius)
				minRadius = radius
			if (maxRadius < radius)
				maxRadius = radius
		})

		let scaledStandardDeviation = normalizationFunction(standardDeviation / 100)
		let scaledStandardDeviation2 = normalizationFunction(standardDeviation2 / 100)
		let scaledStandardDeviation3 = normalizationFunction(standardDeviation3 / 100)
		let underScale = (scaledStandardDeviation - 0) / (normalizationFunction(1) - 0)
		let lowerMidScaling = (scaledStandardDeviation2 - scaledStandardDeviation) / (normalizationFunction(2) - normalizationFunction(1))
		let overMidScaling = (scaledStandardDeviation3 - scaledStandardDeviation2) / (normalizationFunction(3) - normalizationFunction(2))
		let overScale = (maxRadius - scaledStandardDeviation3) / (maxRadius - normalizationFunction(3))
		points = points
			.map(point => {
				let x = point.coordinates.x
				let y = point.coordinates.y
				const radius = hypotneous(x, y)
				if (radius <= normalizationFunction(1)) {
					x = underScale * x
					y = underScale * y
				} else if (radius <= normalizationFunction(2)) {
					let h = hypotneous(x, y)
					let a = getTheta(x, y)
					h -= normalizationFunction(1)
					x = lowerMidScaling * dotX(h, a)
					y = lowerMidScaling * dotY(h, a)
					h = hypotneous(x, y) + scaledStandardDeviation
					a = getTheta(x, y)
					x = dotX(h, a)
					y = dotY(h, a)
				} else if (radius <= normalizationFunction(3)) {
					let h = hypotneous(x, y)
					let a = getTheta(x, y)
					h -= normalizationFunction(2)
					x = overMidScaling * dotX(h, a)
					y = overMidScaling * dotY(h, a)
					h = hypotneous(x, y) + scaledStandardDeviation2
					a = getTheta(x, y)
					x = dotX(h, a)
					y = dotY(h, a)
				} else {
					let h = hypotneous(x, y)
					let a = getTheta(x, y)
					h -= normalizationFunction(3)
					x = overScale * dotX(h, a)
					y = overScale * dotY(h, a)
					h = hypotneous(x, y) + scaledStandardDeviation3
					a = getTheta(x, y)
					x = dotX(h, a)
					y = dotY(h, a)
				}
				const coordinates = { ...point.coordinates, x: x, y: y }
				return { ...point, coordinates: coordinates }
			})

		points.forEach((point) => {
			const x = point.coordinates.x
			const y = point.coordinates.y
			const radius = hypotneous(x, y)
			if (minRadius > radius)
				minRadius = radius
			if (maxRadius < radius)
				maxRadius = radius
		})

		let scaling = 1 / maxRadius
		// linear zooming
		points = points.map(point => {
			const x = scaling * point.coordinates.x
			const y = scaling * point.coordinates.y
			const coordinates = { ...point.coordinates, x: x, y: y }
			return { ...point, coordinates: coordinates }
		})

		result['std'] = scaledStandardDeviation * scaling
		result['std2'] = scaledStandardDeviation2 * scaling
		result['std3'] = scaledStandardDeviation3 * scaling
	}


	if (textAccessor) {
		points = points.map(row => ({ ...row, 'textFloater': row.data[textAccessor] }))
	}

	// adding angle and radius to coordinates data.
	points = points.map((point) => {
		const x = point.coordinates.x
		const y = point.coordinates.y
		const angle = getTheta(x, y)
		const radius = hypotneous(x, y)
		const coordinates = { ...point.coordinates, angle: angle, radius: radius }

		return { ...point, coordinates: coordinates }
	})

	result['points'] = points

	// Label coordinatess
	let labelsPositions = []
	labels.forEach(label => {

		let high = {
			'label': label,
			'anchor': labelTextMapping[label]['high'],
			'angle': anchorInfo[label]['angle']
		}
		let low = {
			'label': label,
			'anchor': labelTextMapping[label]['low'],
			'angle': (anchorInfo[label]['angle'] < Math.PI) ? (anchorInfo[label]['angle'] + Math.PI) : (anchorInfo[label]['angle'] - Math.PI)
		}
		labelsPositions.push(high)
		labelsPositions.push(low)
	})


	result['labels'] = labelsPositions

	return result;
}

export default RawPositioning;
export { dotX, dotY, slope, segmentIntersectCircle, round, adjustedAnchorAngle, rad2deg, getTheta, hypotneous }