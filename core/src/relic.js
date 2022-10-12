/*
 * Relic.js
 * Web-based UI framework that emulates the look and feel of Windows 3.1
 *
 * ( This is a passion project, for the love of everything holy don't use it for
 *   serious projects. )
 *
 * (c) 2022 Danijel Durakovic
 * Licensed under the terms of the MIT license
 *
 */

/*jshint globalstrict:true*/
/*jshint browser:true*/

/**
 * @file relic.js
 * @version 0.0.1
 * @author Danijel Durakovic
 * @copyright 2022
 */

"use strict";

/**
 * relic.js namespace
 * @namespace
 */
let relic = {};

////////////////////////////////////////////////////////////////////////////////////
//
//  Utility functions
//
////////////////////////////////////////////////////////////////////////////////////

relic.util = {};

/**
 * Returns a number limited to a given range.
 *
 * @function clamp
 * @memberof relic.util
 * @instance
 *
 * @param {number} number - Input number.
 * @param {number} min - Lower range boundary.
 * @param {number} max - Upper range boundary.
 *
 * @returns {number}
 */
relic.util.clamp = (number, min, max) => {
	if (number <= min)
		return min;
	else if (number >= max)
		return max;
	return number;
};

////////////////////////////////////////////////////////////////////////////////////
//
//  Controls
//
////////////////////////////////////////////////////////////////////////////////////

relic.control = {};

relic.control.Geometry = class {
	/**
	 * Geometry constructor.
	 *
	 * @param {object} [options] - Geometry options.
	 * @param {object} [options.element]
	 * @param {number} [options.x]
	 * @param {number} [options.y]
	 * @param {number} [options.width]
	 * @param {number} [options.height]
	 */
	constructor(options) {
		// geometry properties
		this._x = options.x || 0;
		this._y = options.y || 0;
		this._width = options.width || 25;
		this._height = options.height || 25;
		// setup the body element
		this._bodyElement = (!options.element)
			? document.createElement('div') // create the base element
			: options.element; // use the provided base element
		this._bodyElement.classList.add('relic-container-body');
	}

	updateSize() {
		this._bodyElement.style.width = this.width + 'px';
		Object.assign(this._bodyElement.style, {
			left: this._x + 'px',
			top: this._y + 'px',
			width: this._width + 'px',
			height: this._height + 'px'
		});
	}

	set x(x) {
		this._x = x;
		this.updateSize();
	}
	
	get x() {
		return this._x;
	}

	set y(y) {
		this._y = y;
		this.updateSize();
	}
	
	get y() {
		return this._y;
	}

	set width(width) {
		this._width = width;
		this.updateSize();
	}
	
	get width() {
		return this._width;
	}

	set height(height) {
		this._height = height;
		this.updateSize();
	}
	
	get height() {
		return this._height;
	}
}

relic.control.Element = class extends relic.control.Geometry {
	/**
	 * Element constructor.
	 *
	 * @param {object} [options] - Element options.
	 * @param {string} [options.name] - A control's name.
	 */
	constructor(options) {
		super(options);
		// element properties
		this._name = options.name;
		this._backgroundColor = options.backgroundColor || ''; // empty string means theme default
		this._foregroundColor = options.foregroundColor || '';
		this._font = options.font || '';
		this._fontSize = options.fontSize || '12px';
		this.tag = ''; // any user defined string
	}

	updateStyle() {
		Object.assign(this._bodyElement.style, {
			backgroundColor: this._backgroundColor,
			color: this.foregroundColor
		});
	}

	updateSize() {
		super.updateSize();
	}

	set backgroundColor(backgroundColor) {
		this._backgroundColor = backgroundColor;
		this.updateStyle();
	}

	set foregroundColor(foregroundColor) {
		this._foregroundColor = foregroundColor;
		this.updateStyle();
	}
}

relic.control.Container = class extends relic.control.Element {
	/**
	 * Container constructor.
	 */
	constructor(options) {
		super(options);
		// list of children
		this._children = [];
		// parent element
		this._parent = null;
		// additional container geometry
		this._offsetTop = 0;
		this._offsetBottom = 0;
		this._offsetLeft = 0;
		this._offsetRight = 0;
		{ //@summon
			// attach the inner element
			this._innerElement = document.createElement('div');
			this._innerElement.classList.add('relic-container-inner');
			this._bodyElement.appendChild(this._innerElement);
			// attach the content element
			this._contentElement = document.createElement('div');
			this._contentElement.classList.add('relic-container-content');
			this._innerElement.appendChild(this._contentElement);
		}
	}

	/**
	 * Adds a child control.
	 *
	 * @param {object} control - An object of base type relic.control.element to add to the
	 *   container.
	 */
	addChild(control) {
		this._children.push(control);
		control._parent = this;
		this._contentElement.appendChild(control._bodyElement);
		// update control's size
		control.updateSize();
		// update control's style
		control.updateStyle();
	}

	/**
	 * Removes a child control.
	 *
	 * @param {string} name - Name of control to remove.
	 */
	removeChild(name) {
		if (name === undefined) {
			return console.warn('Control name must be specified.');
		}
		let n = this._children.length;
		while (n--) {
			var child = this._children[n];
			if (child._name === name) {
				this._children.splice(n, 1);
				break;
			}
		}
	}

	/**
	 * Update container style.
	 */
	updateStyle() {
		Object.assign(this._contentElement.style, {
			backgroundColor: this._backgroundColor,
			color: this.foregroundColor
		});
	}

	/**
	 * Update container size.
	 */
	updateSize() {
		// update all children sizes
		let n = this._children.length;
		while (n--) {
			var child = this._children[n];
			child.updateSize();
		}
		// update this container's size, ignore if this is the top-level container
		if (this._parent) {
			super.updateSize();
		}
		// update container's inner element
		var bodyRect = this._bodyElement.getBoundingClientRect();
		Object.assign(this._innerElement.style, {
			left: this._offsetLeft + 'px',
			top: this._offsetTop + 'px',
			width: (bodyRect.width - this._offsetLeft - this._offsetRight) + 'px',
			height: (bodyRect.height - this._offsetTop - this._offsetBottom) + 'px'
		});
		// update container's content element
		Object.assign(this._contentElement.style, {
			left: 0,
			top: 0,
			width: (bodyRect.width - this._offsetLeft - this._offsetRight) + 'px',
			height: (bodyRect.height - this._offsetTop - this._offsetBottom) + 'px'
		});
	}
}

relic.control.Window = class extends relic.control.Container {	
	/**
	 * Constructs a Window.
	 *
	 * @param {object} [options] - Window options.
	 * @param {string} [options.title] - Window title.
	 * @param {string} [options.windowStyle] - Window style. Can be one of the
	 *   following: sizable (Default), fixed, dialog, tool, none.
	 *
	 * TODO
	 * minWidth, minHeight, startCentered
	 */
	constructor(options) {
		super(options);
		// local variables
		this._dragInProgress = false;
		this._dragMouseOrigin = [0, 0];
		this._dragWindowOrigin = [0, 0];
		// window properties
		this._title = options.title || '';
		this._borderStyle = options.windowStyle || 'sizable';
		{ // @summon
			// attach window-specific class to body element
			this._bodyElement.classList.add('relic-window-body');
			// attach border element
			this._borderElement = document.createElement('div');
			this._borderElement.classList.add('relic-window-border');
			this._bodyElement.appendChild(this._borderElement);
			// attach inner border element
			this._innerBorderElement = document.createElement('div');
			this._innerBorderElement.classList.add('relic-window-inner-border');
			this._bodyElement.appendChild(this._innerBorderElement);
			// attach title element
			this._titleElement = document.createElement('div');
			this._titleElement.classList.add('relic-window-title');
			this._bodyElement.appendChild(this._titleElement);
			// attach decorative corner elements
			this._cornerNWElement = document.createElement('div');
			this._cornerNWElement.classList.add('relic-window-corner-nw');
			this._bodyElement.appendChild(this._cornerNWElement);
			this._cornerNEElement = document.createElement('div');
			this._cornerNEElement.classList.add('relic-window-corner-ne');
			this._bodyElement.appendChild(this._cornerNEElement);
			this._cornerSWElement = document.createElement('div');
			this._cornerSWElement.classList.add('relic-window-corner-sw');
			this._bodyElement.appendChild(this._cornerSWElement);
			this._cornerSEElement = document.createElement('div');
			this._cornerSEElement.classList.add('relic-window-corner-se');
			this._bodyElement.appendChild(this._cornerSEElement);
		}
		// attach events
		let self = this;
		// event: focus
		this._bodyElement.addEventListener('mousedown', (e) => {
			self.focus();
		});
		// event: drag window
		this._titleElement.addEventListener('mousedown', (e) => {
			self._dragInProgress = true;
			self._dragMouseOrigin = [e.clientX, e.clientY];
			self._dragWindowOrigin = [self.x, self.y];
		});
		window.addEventListener('mousemove', (e) => {
			if (self._dragInProgress === true) {
				const dragMouseDelta = [e.clientX - self._dragMouseOrigin[0], e.clientY - self._dragMouseOrigin[1]];
				self.x = relic.util.clamp(self._dragWindowOrigin[0] + dragMouseDelta[0], 0, window.innerWidth - self.width);
				self.y = relic.util.clamp(self._dragWindowOrigin[1] + dragMouseDelta[1], 0, window.innerHeight - self.height);
				
			}
		});
		window.addEventListener('mouseup', (e) => {
			self._dragInProgress = false;
		});
	}

	/**
	 * Update window style.
	 */
	updateStyle() {
		super.updateStyle();
		this._titleElement.innerText = this._title;
	}

	/**
	 * Update window style.
	 */
	updateSize() {
		// set window offsets based on borderStyle
		switch (this._borderStyle) {
			case 'sizable':
				this._offsetTop = 23;
				this._offsetLeft = 4;
				this._offsetRight = 4;
				this._offsetBottom = 4;
				break;
			case 'fixed':
				break;
			case 'dialog':
				break;
			case 'tool':
				break;
			case 'none':
				break;
		}
		// update container size
		super.updateSize();
		// update window-specific elements
		Object.assign(this._borderElement.style, {
			left: '0',
			top: '0',
			width: (this._width - 2) + 'px',
			height: (this._height - 2) + 'px'
		});
		Object.assign(this._innerBorderElement.style, {
			left: '3px',
			top: '3px',
			width: (this._width - 8) + 'px',
			height: (this._height - 8) + 'px'
		});
		this._titleElement.style.width = (this._width - this._offsetLeft - this._offsetRight) + 'px';
	}

	focus() {
		this._bodyElement.classList.add('title-focused');
		this._bodyElement.classList.add('border-focused');
	}

	set title(title) {
		this._title = title;
		this.updateStyle();
	}
}

relic.control.MessageBox = class extends relic.control.Window {
	constructor(options) {
		super();
	}
}

////////////////////////////////////////////////////////////////////////////////////
//
//  Window manager class
//  TODO
//
////////////////////////////////////////////////////////////////////////////////////

relic.WindowManager = class {
}

////////////////////////////////////////////////////////////////////////////////////
//
//  Application class
//
////////////////////////////////////////////////////////////////////////////////////

relic.Application = class {
	/**
	 * Constructs an Application object. Defines the entry point for a Relic.js based application.
	 *
	 * @param {object} options 
	 * @param {object} options.containerElement - Either the DOM element or the element's id representing
	 *   the container for a Relic.js application. This container serves as the desktop metaphor.
	 *
	 */
	constructor(options) {
		// make sure we have a container element
		if (options.containerElement === undefined) {
			throw new Error('No container specified.');
		}
		let containerElement = (options.containerElement instanceof String || typeof options.containerElement === "string")
			? document.querySelector(options.containerElement) // assume containerElement is an id
			: options.container; // assume containerElement is a DOM element
		if (!(containerElement instanceof Element)) {
			throw new Error(options.containerElement + ' is not a valid container.');
		}
		// attach class to container element
		containerElement.classList.add('relic-desktop');
		// create a container control from containerElement
		this.container = new relic.control.Container({
			element: containerElement
		});
		// dispatch initial resize update
		this.container.updateSize();
		// attach resize event
		let self = this;
		window.addEventListener('resize', (e) => {
			// dispatch resize update
			self.container.updateSize();
		});
	}
}
