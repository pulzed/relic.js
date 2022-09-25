/*
 * relic.js example 01 - Basic
 *
 * This example demonstrates basic relic.js features, such as configuring the
 * application, opening a window and adding basic controls.
 *
 */

// create a Relic.js application.
let myApp = new relic.Application({
	containerElement: '#relic-container'
});

// create the main window
let myWindow = new relic.control.Window({
	x: 250,
	y: 100,
	width: 350,
	height: 250,
	title: 'Hello, World'
});

myApp.container.addChild(myWindow);
