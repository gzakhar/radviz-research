export const STATES = [
	{
		name: "New York",
		demographics: '/nyDem.json',
		geometry: '/nyGeo.json',
		mapView: {
			longitude: -76.0861,
			latitude: 42.9420,
			zoom: 6.0
		}
	}, {
		name: "New Jersey",
		demographics: '/njDem.json',
		geometry: '/njGeo.json',
		mapView: {
			longitude: -74.5578,
			latitude: 40.3220,
			zoom: 7.38
		}
	}, {
		name: "California",
		demographics: '/caDem.json',
		geometry: '/caGeo.json',
		mapView: {
			longitude: -119.5578,
			latitude: 37.3220,
			zoom: 5.4
		}
	}]

export const GRAPH_DESCRIPTION = [
	(<>
		<a target="_blank" href='https://www.scikit-yb.org/en/latest/api/features/radviz.html'>RadViz</a>:
		A multivariate data visualization algorithm that plots each feature dimension 
		(called "Anchor" and shown as a <span style={{color: 'red', fontWeight: '700'}}>red</span> dot)
		uniformly around the circumference of the circle, then plots points (shown as <span style={{color: 'black', fontWeight: '700'}}>black</span> dots) 
		on the interior of the circle such that the point normalizes its values on the axes from the center to each arc. 
		The closer a datapoint is to an Anchor, the bigger tha value of that datapoint is for that dimension.
	</>),
	(<>
		S-RadViz: A modified version of a multivatiate data visualization algorithm (RadViz).
		With the biggest change being that instead of displaying each feature dimention as one Anchor along the circumfrence of the circle,
		the dimention is displayed as two opposing Anchors.
		Each of the three dotted circles inscribed into the Graphic represent a standard deviation away from the center (mean),
		most inner circle (1st SD), second from center (2nd SD), third from center (3rd SD).
		The closer a datapoint is to an Anchor, the bigger tha value of that datapoint is for that dimension.
	</>)
]

export const QUIZ_DIRECTIONS = [
	<ol>
		<li>Each County on the map is represented with a black dot on the Graphic.</li>
		<li>Hovering over the black dot will display the name of that County and highlight that County on the Map.</li>
		<li>Clicking on the black dot will turn it <span style={{color: 'green', fontWeight: '700'}}>green</span> and copy name of the County to Clipboard.</li>
		<li>For each question in the GoogleForm, find the county (<span style={{color: 'black', fontWeight: '700'}}>black</span> dot) that best answers the question and paste its name into the response.</li>
	</ol>,
	<ol>
		<li>Each County on the map is represented with a black dot on the Graphic.</li>
		<li>Hovering over the black dot will display the name of that County and highlight that County on the Map.</li>
		<li>Clicking on the black dot will turn it <span style={{color: 'green', fontWeight: '700'}}>green</span> and copy name of the County to Clipboard.</li>
		<li>For each question in the GoogleForm, find the county (<span style={{color: 'black', fontWeight: '700'}}>black</span> dot) that best answers the question and paste its name into the response.</li>
		<li>Each of the three inscribed circles represent a standard deviations away from the mean.</li>
	</ol>,
	<ol>
		<li>Each County on the map is represented with a black dot on the Graphic.</li>
		<li>Hovering over the black dot will display the name of that County and highlight that County on the Map.</li>
		<li>Clicking on the black dot will turn it <span style={{color: 'green', fontWeight: '700'}}>green</span> and copy name of the County to Clipboard.</li>
		<li>For each question in the GoogleForm, find the county (<span style={{color: 'black', fontWeight: '700'}}>black</span> dot) that best answers the question and paste its name into the response.</li>
		<li>Each of the three inscribed circles represent a standard deviations away from the mean.</li>
		<li>Moving the sliders with the three knobs will linearly stretch the positions of the dots from the center (mean). This will give you a more percice view of datapoints between the standard deviations.</li>
		<li>Turning ON/OFF "inter-standard deviation selectors" will remove those counties from the Map and shade out that area on the Graphic.</li>
	</ol>,
]