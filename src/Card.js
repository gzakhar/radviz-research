import React from 'react';
import { Link } from 'react-router-dom';
import classes from './Card.module.css';

const Card = (props) => (

	<div className='card' id={classes.card_dynamic}>
		<div className="card-title">
			<div className={classes.card_title}>{props.title}</div>
		</div>
		<div className={classes.img}>
			{props.image ? <img className="card-img-top" src={props.image} alt="Card cap" /> : ""}
		</div>
		<div className="card-body">
			<div className={classes.card_text}>{props.body}</div>
			<div className={classes.center}>{props.children}</div>
			<Link to={props.link} className='stretched-link' />
		</div>
	</div>


)

export default Card;