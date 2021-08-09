import { scaleLinear, scaleQuantize } from 'd3-scale';
import { extent } from 'd3-array'

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
	console.log("ERROR: invalid slope");
	return null;
}
let xIntersect = (x, y, slope) => {
	if (x * slope != 0) {
		return (y - (x * slope))
	}
	console.log("ERROR: slope is 0");
	return null;
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
	let labels = Object.keys(props.labels);
	let numberOfAnchors = labels.length;

	// Mappings from label to angle of label
	let labelDomain = [0, 2 * Math.PI];
	let label2Theta = (label) => scaleLinear().domain([0, numberOfAnchors]).range(labelDomain)(labels.indexOf(label));
	let theta2Label = scaleQuantize().domain(labelDomain).range(labels);

	// initialize directory of anchor Information.
	let anchorInfo = (() => {
		let labelInfo = {}
		labels.forEach(label => {
			labelInfo[label] = { 'angle': label2Theta(label), 'normalization': normalize(extent(data.map(row => row[label]))) }
		});
		return labelInfo;
	})();

	// map points onto radviz.
	let points = []
	props.content.forEach(e => {
		points.push(mapRadvizpoint(e, anchorInfo))
	});

	// initialized a dictionary of border functions.
	let borderFunctions = ((angle) => {
		let func = {}
		labels.forEach((label, i, labelsArray) => {

			let angle = label2Theta(label);
			let nextAngle = label2Theta((labelsArray[(i + 1) % numberOfAnchors]));

			// y = ax + b
			let a = slope(dotX(1, angle), dotX(1, nextAngle), dotY(1, angle), dotY(1, nextAngle));
			let b = xIntersect(dotX(1, angle), dotY(1, angle), a);

			func[label] = (theta) => {

				let thetaRonded = round(theta, ROUND_TO)
				if (thetaRonded == round(Math.PI / 2, ROUND_TO) || thetaRonded == round(3 * Math.PI / 2, ROUND_TO)) {
					return round(Math.abs(b), ROUND_TO)
				}
				let a2 = Math.tan(theta)
				let x = round(-b / (a - a2), ROUND_TO);
				let y = round(a2 * x, ROUND_TO);

				return hypotneous(x, y)
			}
		})

		return func[theta2Label(angle)](angle);
	});

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

export default RawPositioning ;