import React from 'react';
import { select } from 'd3-selection';
import { RawPositioning } from './RawPositioning';

function TestingUpdate() {



	let data = [{ 'first': 0, 'second': 0, 'third': 0, 'fourth': 0 },
	{ 'first': 1, 'second': 0, 'third': 0, 'fourth': 0 },
	{ 'first': 0, 'second': 1, 'third': 0, 'fourth': 0 },
	{ 'first': 0, 'second': 0, 'third': 1, 'fourth': 0 },
	{ 'first': 0, 'second': 0, 'third': 0, 'fourth': 1 },
	{ 'first': 1, 'second': 1, 'third': 0, 'fourth': 0 },
	{ 'first': 0, 'second': 1, 'third': 1, 'fourth': 0 },
	{ 'first': 0, 'second': 0, 'third': 1, 'fourth': 1 },
	{ 'first': 1, 'second': 0, 'third': 0, 'fourth': 1 },
	{ 'first': 1, 'second': 1, 'third': 1, 'fourth': 0 },
	{ 'first': 0, 'second': 1, 'third': 1, 'fourth': 1 },
	{ 'first': 1, 'second': 0, 'third': 1, 'fourth': 1 },
	{ 'first': 1, 'second': 1, 'third': 0, 'fourth': 1 }]
	let labels = { 'first': 'Right', 'second': 'Top', 'third': 'Left', 'fourth': 'Bottom' }


	let props = {}

	props['content'] = data
	props['labels'] = labels

	let res = RawPositioning(props)
	res.forEach(e => console.log(e))

	return (
		<div className='canvas' />
	);

}

export default TestingUpdate;