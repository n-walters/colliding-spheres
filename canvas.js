"use strict"

// Script is loaded in HTML HEAD, therefore before DOM elements.
window.addEventListener("load", () => {
	console.log("DOM loaded.");
	
	// Variable to hold information about the state of various parts of the app.
	states.infoText = { show: true, opacity: 100 };
	states.colours = { background: 255, text: 0 };
	states.velocity = { multiplier: 1, opacity: 0 };
	states.repulsion = { enabled: true, magnitude: 0.025, opacity: 0 };
	
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
	// Adjusts canvas to fill entire window.
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
	
	// Generate Spheres and populate the 'objects' list.
	for (let i = 0; i < amount; i++) {
		objects.push(SphereFactory({
			radius: 20,
			position: {
				x: { min: 0, max: canvas.width },
				y: { min: 0, max: canvas.height }
			},
			velocity: {
				x: { min: -2, max: 2 },
				y: { min: -2, max: 2 }
			},
			colour: colours[Math.round(randomBetween(0, colours.length - 1))]
		}, objects));
	}
	
	// Sets a few initial style settings.
	const context = canvas.getContext("2d");
	context.lineWidth = 2;
	context.font = "20px calibri";
	context.textBaseline = "top";
	
	return context;
}

function animate(context, objects, mouse, states) {
	animation = window.requestAnimationFrame(() => animate(context, objects, mouse, states));
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	
	// Info text will either be displayed or faded out.
	if (states.infoText.opacity > 0) {
		context.fillStyle = rgbString(states.colours.text, states.infoText.opacity / 100);
		const text = [
			" Click to pause/resume",
			" Scroll to change sphere speed",
			" Shift+Scroll to change mouse repulsion",
			"\"A\" to create a sphere",
			"\"D\" to destroy a sphere",
			"\"R\" to toggle mouse repulsion",
			"\"W\" to show/hide info",
			"\"B\" to cycle background colour"
		];
		for (let i = 0; i < text.length; i++) {
			context.fillText(text[i], 10, i * 30 + 100);
		}
		if (states.infoText.show === false) {
			states.infoText.opacity -= 5;
		}
	}
	
	// Velocity multiplier text will be displayed and then faded out.
	if (states.velocity.opacity > 0) {
		context.fillStyle = rgbString(states.colours.text, states.velocity.opacity / 100);
		context.fillText(`Velocity multiplier: ${states.velocity.multiplier}`, 15, 10);
		states.velocity.opacity -= 3;
	}
	
	// Repulsion magnitude text will be displayed and then faded out.
	if (states.repulsion.opacity > 0) {
		context.fillStyle = rgbString(states.colours.text, states.repulsion.opacity / 100);
		context.fillText(`Repulsion magnitude: ${states.repulsion.magnitude}`, 15, 25);
		states.repulsion.opacity -= 3;
	}
	
	// Updates and then draws each object.
	objects.forEach(object => {
		object.update(context, objects, mouse, states);
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
	// Pauses or resumes the animation.
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
			// Generates and adds a new Sphere.
			objects.push(SphereFactory({
				radius: 20,
				position: {
					x: { min: 0, max: canvas.width },
					y: { min: 0, max: canvas.height }
				},
				velocity: {
					x: { min: -2, max: 2 },
					y: { min: -2, max: 2 }
				},
				colour: colours[Math.round(randomBetween(0, colours.length - 1))]
			}, objects));
			break;
		case 68: // "D"
			// Removes the first Sphere.
			objects.shift();
			break;
		case 87: // "W"
			// Toggles info text on/off. Sets opacity to 100% when turned on.
			states.infoText.show = !states.infoText.show;
			if (states.infoText.show) {
				states.infoText.opacity = 100;
			}
			break;
		case 82: // "R"
			// Toggles the mouse repelling spheres.
			states.repulsion = !states.repulsion;
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

window.addEventListener("wheel", e => {
	if (e.shiftKey) {
		// Scrolling will increase/decrease the effect of the mouse's sphere
		// repulsion. Also sets the opacity of the relevant HUD text.
		if (e.deltaY < 0) {
			states.repulsion.magnitude += 0.001;
			states.repulsion.opacity = 100;
		} else {
			states.repulsion.magnitude -= 0.001;
			states.repulsion.opacity = 100;
		}
		// Workaround to an issue where JavaScript incorrectly handles floats.
		states.repulsion.magnitude =
			Math.round(states.repulsion.magnitude * 10000) / 10000;
	} else {
		// Scrolling up or down will increase/decrease the multiplier applied to
		// a Sphere's velocity. Also sets the opacity of the relevant HUD text.
		if (e.deltaY < 0) {
			states.velocity.multiplier += 0.05;
			states.velocity.opacity = 100;
		} else {
			states.velocity.multiplier -= 0.05;
			states.velocity.opacity = 100;
		}
		// Workaround to an issue where JavaScript incorrectly handles floats.
		states.velocity.multiplier =
			Math.round(states.velocity.multiplier * 100) / 100;
	}
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Prototypes                                                       */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function Sphere(radius, position, velocity, colour) {
	this.radius = radius;
	this.position = position;
	this.velocity = velocity;
	this.mass = 1;
	this.colour = colour;
	this.opacity = 0.2;
	
	// Draws the Sphere to the canvas.
	// The outline is solid, the center filled with the sphere's opacity.
	this.draw = (context) => {
		context.beginPath();
		context.arc(this.position.x, this.position.y, this.radius,
			0, Math.PI * 2, false);
		context.fillStyle = `rgb(${this.colour}, ${this.opacity})`;
		context.fill();
		context.strokeStyle = `rgb(${this.colour})`;
		context.stroke();
	}
	
	// Updates Sphere properties.
	this.update = (context, objects, mouse, states) => {
		this.position.x += this.velocity.x * states.velocity.multiplier;
		this.position.y += this.velocity.y * states.velocity.multiplier;
		
		// Canvas edge collision.
		// Is moving out of either left/right. Horizontal velocity reversed.
		if (this.position.x - this.radius <= 0 ||
			this.position.x + this.radius >= context.canvas.width) {
				this.velocity.x *= -1;
		}
		// Is moving out of either top/bottom. Vertical velocity reversed.
		if (this.position.y - this.radius <= 0 ||
			this.position.y + this.radius >= context.canvas.height) {
				this.velocity.y *= -1;
		}
		
		// Mouse interaction
		const distance =
			distanceBetween(this.position.x, this.position.y, mouse.x, mouse.y);
		if (distance < mouse.distance) {
			// Velocity is increased in the direction opposite to the mouse's
			// position with a magnitude proportional to the distance between
			// the two.
			if (states.repulsion.enabled) {
				this.velocity.x +=
					states.repulsion.magnitude *
					(this.position.x - mouse.x) / distance;
				this.velocity.y +=
					states.repulsion.magnitude *
					(this.position.y - mouse.y) / distance;
			}
			// If close, increases opacity by 0.02, up to 1
			// Otherwise decreases by 0.02 to a minimum of 0.2
			this.opacity = Math.min(this.opacity + 0.02, 1);
		} else {
			this.opacity = Math.max(this.opacity - 0.02, 0.2);
		}
		
		// Collisions with other spheres
		objects.forEach(object => {
			// Check the distance between this sphere and all others.
			// If the distance is less than the radii, attempt to resolve
			// the collision.
			if (object !== this &&
				distanceBetween(this.position.x, this.position.y,
					object.position.x, object.position.y) <
					this.radius + object.radius) {
						// Will return undefined in the case that the spheres
						// only moved past one another rather than colliding.
						const result = resolveCollision(this, object);
						if (result !== undefined) {
							this.velocity = result[0];
							object.velocity = result[1];
						}
			}
		});
	}
}

// factory function for creating Sphere objects.
// Takes an object with 'radius', 'position', 'velocity', and 'colour' properties.
function SphereFactory(parameters, objects) {
	
	// Chooses a random value between min and max for both x and y, then rounds
	// to an integer.
	let p = {
		x: Math.round(randomBetween(
			parameters.position.x.min + parameters.radius,
			parameters.position.x.max - parameters.radius)
		),
		y: Math.round(randomBetween(
			parameters.position.y.min + parameters.radius,
			parameters.position.y.max - parameters.radius)
		)
	};
	
	if (objects.length > 1) {
		// Compares the current sphere to all others and checks for overlaps in
		// position. If there is an overlap, the factory function is re-called
		// recursively until a unique position is found.
		if (!objects.every(object =>
			distanceBetween(p.x, p.y, object.position.x, object.position.y) >
			parameters.radius + object.radius)) {
				return SphereFactory(parameters, objects);
		}
	}
	
	// Chooses a random value between min and max for both x and y, then rounds
	// to 2 decimal places.
	const v = {
		x: Math.round(randomBetween(
			parameters.velocity.x.min, parameters.velocity.x.max) * 100) / 100,
		y: Math.round(randomBetween(
			parameters.velocity.y.min, parameters.velocity.y.max) * 100) / 100
	};
	return new Sphere(parameters.radius, p, v, parameters.colour);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Utility functions                                                */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function randomBetween(min, max) {
	return Math.random() * (max - min) + min;
}

// Returns a CSS rgb or rgba colour string consisting of the one colour given.
function rgbString(colour, opacity) {
	if (opacity) {
		return `rgba(${colour}, ${colour}, ${colour}, ${opacity})`;
	} else {
		return `rgb(${colour}, ${colour}, ${colour})`;
	}
}

// Calculates distance between two points using the Pythagorean equation.
function distanceBetween(x1, y1, x2, y2) {
	const delta = { x: x2 - x1, y: y2 - y1 };
	return Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
}

// Calculates velocities when the reference axes are rotated by a specific angle.
function rotateVelocity(velocity, angle) {
	return {
		x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
		y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
	}
}

// Calculates the resulting velocities after a collision
function resolveCollision(object1, object2) {
	
	// Position (p) and velocity (v) differences of the spheres.
	const deltas = {
		p: {
			x: object2.position.x - object1.position.x,
			y: object2.position.y - object1.position.y
		},
		v: {
			x: object1.velocity.x - object2.velocity.x,
			y: object1.velocity.y - object2.velocity.y
		}
	};
	
	// Only attempt to resolve the collision if the particles will actually
	// collide rather than simply brush past with a gap of 0 pixels.
	if (deltas.v.x * deltas.p.x + deltas.v.y * deltas.p.y >= 0) {
		// Finds the angle of the plane of collision.
		// Takes the negative as the origin of axes is top-left rather than
		// bottom-left.
		const angle = Math.atan(deltas.p.y / deltas.p.x) * -1;
		
		// Finds the velocity components in the direction of the collision.
		const u1 = rotateVelocity(object1.velocity, angle);
		const u2 = rotateVelocity(object2.velocity, angle);
		
		// Aliases for the object masses in order to the make the ensuing
		// formula more readable.
		const m1 = object1.mass;
		const m2 = object2.mass;
		
		// One-dimensional Newtonian collision
		// https://en.wikipedia.org/wiki/Elastic_collision#One-dimensional_Newtonian
		const v1 = {
			x: (u1.x * (m1 - m2) + 2 * m2 * u2.x) / (m1 + m2),
			y: u1.y
		};
		const v2 = {
			x: (u2.x * (m1 - m2) + 2 * m2 * u1.x) / (m1 + m2),
			y: u2.y
		};
		
		// Rotates velocities back to the original axes and returns.
		return [rotateVelocity(v1, -angle), rotateVelocity(v2, -angle)];
	}
}