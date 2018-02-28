"use strict"

// Script is loaded in HTML HEAD, therefore before DOM elements.
window.addEventListener("load", () => {
	console.log("%cDOM loaded.", "color: green");
	
	const canvas = document.getElementById("canvas");
	
	context = init(canvas);
	
	animate(context, objects);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Declarations                                                     */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
let context;
let animation;
const objects = [];

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Implement                                                        */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function init(canvas) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	objects.push(factory_Sphere(20,
		{ x: { min: 0, max: canvas.width }, y: { min: 0, max: canvas.height } },
		{ x: { min: -2, max: 2 }, y: { min: -2, max: 2 } }
	));
	
	return canvas.getContext("2d");
}

function animate(context, objects) {
	animation = window.requestAnimationFrame(() => animate(context, objects));
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	
	objects.forEach(object => {
		object.update(context);
		object.draw(context);
	});
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Event listeners                                                  */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
window.addEventListener("resize", () => {
	console.log("%cWindow resized. Re-initialising.", "color: green");
	context = init(context.canvas);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Prototypes                                                       */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function Sphere(radius, position, velocity) {
	this.radius = radius;
	this.position = position;
	this.velocity = velocity;
	
	this.draw = (context) => {
		context.beginPath();
		context.arc(
			this.position.x,
			this.position.y,
			this.radius,
			0,
			Math.PI * 2,
			false);
		context.stroke();
	}
	
	this.update = (context) => {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

function factory_Sphere(r, posRange, velRange) {
	// Chooses a random value between min and max for both x and y, then rounds
	// to an integer.
	const p = {
		x: Math.round(randomBetween(posRange.x.max, posRange.x.min)),
		y: Math.round(randomBetween(posRange.y.max, posRange.y.min))
	};
	// Chooses a random value between min and max for both x and y, then rounds
	// to 2 decimal places.
	const v = {
		x: Math.round(100 * randomBetween(velRange.x.max, velRange.x.min)) / 100,
		y: Math.round(100 * randomBetween(velRange.y.max, velRange.y.min)) / 100
	};
	return new Sphere(r, p, v);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Utility functions                                                */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function randomBetween(min, max) {
	return Math.random() * (max - min) + min;
}