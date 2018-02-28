"use strict"

// Script is loaded in HTML HEAD, therefore before DOM elements.
window.addEventListener("load", () => {
	console.log("%cDOM loaded.", "color: green");
	
	const canvas = document.getElementById("canvas");
	
	context = init(canvas);
	
	animate(context);
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Declarations                                                     */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
let context;
let animation;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Implement                                                        */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function init(canvas) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	return canvas.getContext("2d");
}

function animate(context) {
	animation = window.requestAnimationFrame(() => animate(context));
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*          Event listeners                                                  */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
window.addEventListener("resize", () => {
	console.log("%cWindow resized. Re-initialising.", "color: green");
	context = init(context.canvas);
});