import { scaleLinear, scaleQuantize } from 'd3-scale';
import { extent } from 'd3-array'
import { upperFirst } from 'lodash';

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

let xIntersect = (x, y, slope) => {
	if (slope === undefined) console.warn('slope undefined')
	return (y - (x * slope))
}

let mapRadvizpoint = (row, anchorInfo) => {

	let x = 0;
	let y = 0;
	let point = { x: 0, y: 0, angle: 0, radius: 0 };
	let sumUnits = 0;

	Object.keys(anchorInfo).forEach((anchor, i) => {

		let pointRadius = anchorInfo[anchor].normalization(row[anchor])
		if (pointRadius != 0) {

			let angle = anchorInfo[anchor].angle
			x += round(dotX(pointRadius, angle), ROUND_TO)
			y += round(dotY(pointRadius, angle), ROUND_TO)

			sumUnits += pointRadius
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

function normalize(minMaxArray) {

	return scaleLinear().domain(minMaxArray).range([0, 1]);
}

function RawPositioning(props, zoom = true) {

	let data = props.content;
	// TODO: order of labels is determined by the angles at which they are displayed.
	// let labels = Object.keys(props.labels);
	// Sorted Array of labels.
	let labels = Object.keys(props.labelsDict)
	labels.sort((f, s) => props.labelsDict[f] - props.labelsDict[s])
	// console.log('sorted-array-of-labels: ', labels)
	let numberOfAnchors = labels.length;

	// Mappings from label to angle of label
	let labelDomain = [0, 2 * Math.PI];
	// TODO: label2Theta is puerly determined by the dictoinary of labels provided.
	// let label2Theta = (label) => scaleLinear().domain([0, numberOfAnchors]).range(labelDomain)(labels.indexOf(label));
	let label2Theta = (label) => deg2rad(props.labelsDict[label])
	// console.log('label2Theta test1: (white_ratio) => ', rad2deg(label2Theta('white_ratio')))
	// console.log('label2Theta test2: (age_median) => ', rad2deg(label2Theta('age_median')))
	// console.log('label2Theta test3: (income_per_capita) => ', rad2deg(label2Theta('income_per_capita')))
	// TODO: theta2Index should return the index of borderFunction which is the next smallers value.
	let theta2Index = ((angle) => {
		for (let i = 0; i < labels.length - 1; i++) {
			let label = labels[i]
			let nextLabel = labels[i + 1]
			if (angle >= deg2rad(props.labelsDict[label]) && angle < deg2rad(props.labelsDict[nextLabel])) {
				return i
			}
		}
		return labels.length - 1
	})

	// console.log('theta2Index test1: (0) => ', labels[theta2Index(0)])
	// console.log('theta2Index test2: (60) => ', labels[theta2Index(60)])
	// console.log('theta2Index test3: (120) => ', labels[theta2Index(120)])
	// console.log('theta2Index test4: (180) => ', labels[theta2Index(180)])
	// console.log('theta2Index test5: (240) => ', labels[theta2Index(240)])
	// console.log('theta2Index test6: (300) => ', labels[theta2Index(300)])
	// console.log('theta2Index test7: (360) => ', labels[theta2Index(360)])
	// console.log('theta2Index test8: (20) => ', labels[theta2Index(20)])


	// initialize directory of anchor Information.
	let anchorInfo = (() => {
		let labelInfo = {}
		labels.forEach(label => {
			labelInfo[label] = { 'angle': label2Theta(label), 'normalization': normalize(extent(data.map(row => row[label]))) }
		});
		return labelInfo;
	})();

	// console.log('anchorInformation: ', anchorInfo)

	// map points onto radviz.
	let points = []
	props.content.forEach(e => {
		points.push(mapRadvizpoint(e, anchorInfo))
	});


	// initialized a dictionary of border functions.
	let borderFunctionDict = (() => {
		let func = {}
		labels.forEach((label, i, labelsArray) => {
			// console.log('startLabel: ', label)
			// console.log('nextLabel: ', labelsArray[(i + 1) % numberOfAnchors])
			let angle = label2Theta(label);
			let nextAngle = label2Theta((labelsArray[(i + 1) % numberOfAnchors]));

			// console.log('angle: ', rad2deg(angle))
			// console.log('nextAngle:', rad2deg(nextAngle))

			// y = ax + b
			let a = slope(dotX(1, angle), dotX(1, nextAngle), dotY(1, angle), dotY(1, nextAngle));
			let b = xIntersect(dotX(1, angle), dotY(1, angle), a);
			let xIntersept = dotX(1, angle)
			// console.log('slope: ', round(a, 100))
			// console.log('y-intersect: ', round(b, 100))

			// if slope of border function is (effective) zero. 
			if (Math.abs(round(a, 10000000)) === 0) {
				func[i] = (theta) => {
					// console.log('border function slope is zero ')
					let thetaRonded = round(theta, ROUND_TO)
					// if tan(theta) undefined
					if (thetaRonded == round(Math.PI / 2, ROUND_TO) || thetaRonded == round(3 * Math.PI / 2, ROUND_TO)) {
						// find intersection with x = 0 and y=ax+b
						return round(Math.abs(b), ROUND_TO)
					}

					// if not y = b
					let a2 = Math.tan(theta)
					let y = b
					let x = round(y / a2, ROUND_TO)
					return hypotneous(x, y)
				}
			}
			// if slope of border function is (effective) undefined.
			else if (a > 10000000) {
				func[i] = (theta) => {
					// console.log('border function slope is undefined')
					let a2 = Math.tan(theta)
					let x = xIntersept
					let y = a2 * x

					return hypotneous(x, y)
				}
			}
			// else border function is regular
			else {
				func[i] = (theta) => {
					// console.log('border function slope is normal')
					let thetaRonded = round(theta, ROUND_TO)

					// if tan(theta) undefined
					if (thetaRonded == round(Math.PI / 2, ROUND_TO) || thetaRonded == round(3 * Math.PI / 2, ROUND_TO)) {
						// find intersection with x = 0 and y=ax+b
						return round(Math.abs(b), ROUND_TO)
					}

					let a2 = Math.tan(theta)
					let x = round(-b / (a - a2), ROUND_TO);
					let y = round(a2 * x, ROUND_TO);


					return hypotneous(x, y)
				}
			}

		})
		return func
	})();

	let borderFunctions = (angle) => {
		console.log(`index of border function, angle ${angle}: `, theta2Index(angle))
		let borderFunction = borderFunctionDict[theta2Index(angle)]
		let length = borderFunction(angle)
		console.log(`angle: ${rad2deg(angle)}: length: `, length)
		return length
	}


	// scaling by border functions
	points = points.map((point) => {
		let scaling = 1 / borderFunctions(getTheta(point.coordinates.x, point.coordinates.y));
		const x = scaling * point.coordinates.x
		const y = scaling * point.coordinates.y
		const coordinates = { ...point.coordinates, x: x, y: y }
		return { ...point, coordinates: coordinates }
	})


	if (zoom) {

		// get min and max of radius
		let minRadius = 1
		let maxRadius = 0
		points.forEach((point) => {
			const x = point.coordinates.x
			const y = point.coordinates.y
			const radius = hypotneous(x, y)
			if (minRadius > radius)
				minRadius = radius
			if (maxRadius < radius)
				maxRadius = radius
		})

		// linear zooming
		points = points.map(point => {
			let scaling = 1 / maxRadius
			// point.coordinates.x *= CHART_R / maximumRadius;
			// point.coordinates.y *= CHART_R / maximumRadius;
			const x = scaling * point.coordinates.x
			const y = scaling * point.coordinates.y
			const coordinates = { ...point.coordinates, x: x, y: y }
			return { ...point, coordinates: coordinates }
		})
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

	// Label coordinatess
	let labelsPositions = labels.map(label => ({
		'label': label,
		'anchor': props.labels[label],
		'angle': anchorInfo[label]['angle']
	}))

	let result = { 'points': points, 'labels': labelsPositions }

	return result;
}

export { RawPositioning };