import { getDefaultNormalizer } from '@testing-library/dom';
import { scaleOrdinal, scaleLinear, scaleThreshold, scaleQuantize } from 'd3-scale';
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

let mapRadvizpoint = (row, anchorInfo, borderFunctions) => {

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

	let angle = getTheta(x, y);

	// console.log('norm: ', row)
	if (sumUnits != 0) {

		let scaling = 1 / sumUnits;
		// Radvix Scaling
		x = scaling * x;
		y = scaling * y;
		// console.log('radviz: ', [x, y])

		scaling = 1 / borderFunctions(angle);
		// console.log(rad2deg(angle), borderFunctions(angle))
		// Border Scaling
		x = scaling * x;
		y = scaling * y;
		// console.log('border: ', [x, y])
	}

	// set points
	point.x = x;
	point.y = y;
	point.angle = angle;
	point.radius = hypotneous(x, y)

	return {
		data: row,
		coordinates: point
	}
}

function normalize(minMaxArray) {

	return scaleLinear().domain(minMaxArray).range([0, 1]);
}

function RawPositioning(props) {

	let CHART_R = 200;
	let data = props.content;
	let labels = Object.keys(props.labels);
	let numberOfAnchors = labels.length;

	let labelDomain = [0, 2 * Math.PI];
	let label2Theta = (label) => scaleLinear().domain([0, numberOfAnchors]).range(labelDomain)(labels.indexOf(label));
	let theta2Label = scaleQuantize().domain(labelDomain).range(labels);

	// initialize directory of anchor Information.
	let anchorInfo = (() => {
		let labelInfo = {}
		labels.forEach(label => {
			labelInfo[label] = { 'angle': label2Theta(label), 'normalization': normalize(extent(data.map(row => row[label])), CHART_R) }
		});
		return labelInfo;
	})();

	// initialized a dictionary of border functions.
	let borderFunctions = ((angle) => {
		let func = {}
		labels.forEach((label, i, array) => {

			let angle = label2Theta(label);
			let nextAngle = label2Theta((array[(i + 1) % numberOfAnchors]));

			// y = ax + b
			let a = slope(dotX(1, angle), dotX(1, nextAngle), dotY(1, angle), dotY(1, nextAngle));
			let b = xIntersect(dotX(1, angle), dotY(1, angle), a);

			func[label] = (theta) => {
				if (theta == -Math.PI / 2 || theta == Math.PI / 2 || theta == 3 * Math.PI / 2) {
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


	// Point coordinates.
	let points = []
	props.content.forEach(e => {
		points.push(mapRadvizpoint(e, anchorInfo, borderFunctions))
	});

	// Label coordinatess
	let labelsPositions = labels.map(label => ({
		'label': label,
		'anchor': props.labels[label],
		'angle': rad2deg(anchorInfo[label]['angle'])
	}))

	let result = { 'points': points, 'labels': labelsPositions }

	return result;
}

export { RawPositioning };