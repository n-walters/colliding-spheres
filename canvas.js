"use strict"

// Script is loaded in HTML HEAD, therefore before DOM elements.
window.addEventListener("load", () => {
	console.log("DOM loaded.");
	
	states.infoText = { show: true, opacity: 100 };
	states.colours = { background: 255, text: 0 };
	
	const canvas = document.getElementById("canvas");
	context = init(canvas);
	animate(context, objects, mouse, states);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Declarations                                                     */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
let context;
let animation;
const mouse = {};
const objects = [];
const states = {};
const colours = ["33,133,197", "126,206,253", "255,127,102"];

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Implement                                                        */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function init(canvas) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	// Calculates a reasonable number of spheres based on the estimate of
	// 1 sphere per 7500 pixels. Rounded to the nearest 5.
	const amount = 5 * Math.round((canvas.width * canvas.height) / 37500);
	console.log(`Creating ${amount} spheres.`);
	
	// Calculates a reasonable radius for the mouse to affect spheres.
	// Minimum of 75, increasing linearly by 1 for every 12 of window size.
	mouse.distance = Math.round(Math.min(canvas.width, canvas.height) / 12 + 75);
	console.log(`Mouse influence radius of ${mouse.distance}.`);
	
	for (let i = 0; i < amount; i++) {
		objects.push(factory_Sphere(
			20,
			{ x: { min: 0, max: canvas.width }, y: { min: 0, max: canvas.height } },
			{ x: { min: -2, max: 2 }, y: { min: -2, max: 2 } },
			colours[Math.round(randomBetween(0, colours.length - 1))]
		));
	}
	
	const context = canvas.getContext("2d");
	context.lineWidth = 2;
	context.font = "20px calibri";
	context.textBaseline = "top";
	
	return context;
}

function animate(context, objects, mouse, states) {
	animation = window.requestAnimationFrame(() => animate(context, objects, mouse, states));
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	
	// Will display info text or fade out over time
	if (states.infoText.opacity > 0) {
		
		context.fillStyle = rgbString(states.colours.text, states.infoText.opacity / 100);
		context.fillText(" Click to pause/resume", 10, 100);
		context.fillText("\"A\" to create a sphere", 10, 130);
		context.fillText("\"D\" to destroy a sphere", 10, 160);
		context.fillText("\"W\" to show/hide info", 10, 190);
		context.fillText("\"B\" to cycle background colour", 10, 220);
		if (states.infoText.show === false) {
			states.infoText.opacity -= 5;
		}
	}
	
	objects.forEach(object => {
		object.update(context, mouse);
		object.draw(context);
	});
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Event listeners                                                  */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
window.addEventListener("resize", () => {
	console.log("Window resized. Re-initialising.");
	objects.length = 0;
	context = init(context.canvas);
});

window.addEventListener("click", () => {
	if (animation === undefined) {
		console.log("Resuming animation.");
		animate(context, objects, mouse, states);
	} else {
		console.log("Pausing animation.");
		window.cancelAnimationFrame(animation);
		animation = undefined;
	}
});

window.addEventListener("keydown", e => {
	switch (e.keyCode) {
		case 65: // "A"
			objects.push(factory_Sphere(
				20,
				{ x: { min: 0, max: context.canvas.width },
				  y: { min: 0, max: context.canvas.height }
				},
				{ x: { min: -2, max: 2 }, y: { min: -2, max: 2 } },
				colours[Math.round(randomBetween(0, colours.length - 1))]
			));
			break;
		case 68: // "D"
			objects.shift();
			break;
		case 87: // "W"
			// Toggles info text on/off. Sets opacity to 100 when turned on.
			states.infoText.show = !states.infoText.show;
			if (states.infoText.show) {
				states.infoText.opacity = 100;
			}
			break;
		case 66: // "B"
			// Reduces background colour by 15, after 0 it will loop back to 255
			// Changes text colour from black to white at a given threshold.
			states.colours.background -= 15;
			if (states.colours.background < 70 && states.colours.text === 0) {
				states.colours.text = 255;
			}
			else if (states.colours.background < 0) {
				states.colours.background = 255;
				states.colours.text = 0;
			};
			context.canvas.setAttribute("style",
				"background: " + rgbString(states.colours.background)
			);
			break;
	}
});

window.addEventListener("mousemove", e => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Prototypes                                                       */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function Sphere(radius, position, velocity, colour) {
	this.radius = radius;
	this.position = position;
	this.velocity = velocity;
	this.colour = colour;
	this.opacity = 0.2;
	
	this.draw = (context) => {
		context.beginPath();
		context.arc(this.position.x, this.position.y, this.radius,
			0, Math.PI * 2, false);
		context.fillStyle = `rgb(${this.colour}, ${this.opacity})`;
		context.fill();
		context.strokeStyle = `rgb(${this.colour})`;
		context.stroke();
	}
	
	this.update = (context, mouse) => {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		
		// Canvas edge collision.
		if (this.position.x - this.radius <= 0 ||
			this.position.x + this.radius >= context.canvas.width) {
				this.velocity.x *= -1;
		}
		if (this.position.y - this.radius <= 0 ||
			this.position.y + this.radius >= context.canvas.height) {
				this.velocity.y *= -1;
		}
		
		// Mouse interaction
		const distance = distanceBetween(
			this.position.x, this.position.y, mouse.x, mouse.y);
		if (distance < mouse.distance) {
			this.opacity = Math.min(this.opacity + 0.02, 1);
		} else {
			this.opacity = Math.max(this.opacity - 0.02, 0.2);
		}
	}
}

function factory_Sphere(r, posRange, velRange, c) {
	// Chooses a random value between min and max for both x and y, then rounds
	// to an integer.
	const p = {
		x: Math.round(randomBetween(posRange.x.min + r, posRange.x.max - r)),
		y: Math.round(randomBetween(posRange.y.min + r, posRange.y.max - r))
	};
	// Chooses a random value between min and max for both x and y, then rounds
	// to 2 decimal places.
	const v = {
		x: Math.round(100 * randomBetween(velRange.x.min, velRange.x.max)) / 100,
		y: Math.round(100 * randomBetween(velRange.y.min, velRange.y.max)) / 100
	};
	return new Sphere(r, p, v, c);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Utility functions                                                */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function randomBetween(min, max) {
	return Math.random() * (max - min) + min;
}

function rgbString(colour, opacity) {
	if (opacity) {
		return `rgba(${colour}, ${colour}, ${colour}, ${opacity})`;
	} else {
		return `rgb(${colour}, ${colour}, ${colour})`;
	}
}

// Distance between two points using the Pythagorean equation
function distanceBetween(x1, y1, x2, y2) {
	const delta = { x: x2 - x1, y: y2 - y1 };
	return Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
}