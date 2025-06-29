﻿// Functions for updating DOM
const html = {
	htmlBooleanAttributes: ['autocomplete', 'checked', 'disabled', 'readonly', 'required', 'autofocus'],

	createElement(tagName) {
		return document.createElement(tagName);
	},

	createTextElement(text) {
		return document.createTextNode(text);
	},

	insertElement(parentElement, element, index) {
		if (index !== undefined) { // Checking 'if (index)' is not correct for this case, because '0' is valid value
			parentElement.insertBefore(element, parentElement.children[index]);
		} else {
			parentElement.appendChild(element);
		}
	},

	removeElement(element) {
		element.remove();
	},

	replaceElement(oldElement, newElement) {
		oldElement.parentNode.replaceChild(newElement, oldElement);
	},

	setText(element, text) {
		element.textContent = text;
	},

	setAttribute(element, attrName, attrValue) {

		// Special case 0: Experimental
		if ((attrValue === undefined) || (attrValue === null)) { // 'false', '0', 'empty string' are valid
			element.removeAttribute(attrName);
			return;
		}

		// Special case 1: https://stackoverflow.com/a/78452513
		if ((attrName === 'value') || (element.tagName === 'input')) {
			element.value = attrValue;
			return;
		}

		// Special case 2: "Boolean" specific attributes
		if (this.htmlBooleanAttributes.includes(attrName)) {
			if (attrValue) {
				// TODO: Try to find way for setting "short-form" attribute (without value)
				element.setAttribute(attrName, attrName);
			} else {
				element.removeAttribute(attrName);
			}
			return;
		}

		// Special case 3: Support compatibility with react/preact
		if (attrName === 'className') {
			element.setAttribute('class', attrValue);
			return;
		}

		// Special case 4: CSS styles
		if (attrName === 'style') {
			Object.assign(element.style, attrValue);
			return;
		}

		// Default behavior
		element.setAttribute(attrName, attrValue);
	},

	removeAttribute(element, attrName) {
		element.removeAttribute(attrName);
	},
};

Array.prototype.removeValue = function (value) {
	const index = this.indexOf(value);
	this.splice(index, 1);
};

function fillDomElement(vnode, instances) {

	if (vnode.tagName) {
		vnode.domElement = html.createElement(vnode.tagName);

		for (const propKey in vnode.attributes) {
			html.setAttribute(vnode.domElement, propKey, vnode.attributes[propKey]);
		}

		for (const child of vnode.childNodes) {
			html.insertElement(vnode.domElement, fillDomElement(child, instances));
		}

		for (const eventKey in vnode.events) {
			vnode.domElement.addEventListener(eventKey, event => vnode.events[event.type].call(vnode, event), false);
		}
	} else { // Text element
		vnode.domElement = html.createTextElement(vnode.text);
	}

	if (vnode.instance) {
		instances.push(vnode.instance);
	}

	return vnode.domElement;
}

function update(oldVnode, newVnode) { // Recursively
	if (oldVnode.instance) {
		if (oldVnode.instance.props !== newVnode.instance.props) {
			oldVnode.instance.setState(oldVnode.instance.state, null, newVnode.instance.props);
			return;
		}
	}

	if ((oldVnode.tagName) && (oldVnode.tagName === newVnode.tagName)) {
		updateAttributes(oldVnode, newVnode);

		if (oldVnode.childNodes.length || newVnode.childNodes.length) {
			const pairs = getPairs(oldVnode.childNodes, newVnode.childNodes);
			pairs.forEach((pair, index) => {
				if (pair.oldVnode && pair.newVnode) { // Both, old Vnode & new Vnode exist
					update(pair.oldVnode, pair.newVnode);
				} else if (pair.oldVnode) { // Only old Vnode exists
					oldVnode.childNodes.removeValue(pair.oldVnode);
					unmountComponents(pair.oldVnode);
					html.removeElement(pair.oldVnode.domElement);
				} else if (pair.newVnode) { // Only new Vnode exists
					const instances = [];
					const newChildElement = fillDomElement(pair.newVnode, instances);
					html.insertElement(oldVnode.domElement, newChildElement, index);
					mountComponents(instances);
					oldVnode.childNodes.push(pair.newVnode);
				}
			});
		}

	} else if ((oldVnode.text !== undefined) && (newVnode.text !== undefined)) {
		if (oldVnode.text !== newVnode.text) {
			html.setText(oldVnode.domElement, newVnode.text);
			oldVnode.text = newVnode.text;
		}
	} else {
		const oldElement = oldVnode.domElement;
		const instances = [];
		const newElement = fillDomElement(newVnode, instances);
		unmountComponents(oldVnode);
		html.replaceElement(oldElement, newElement);
		mountComponents(instances);
	}
}

// "Greedy Algorithm" of searching same/similar virtual nodes from old & new versions
function getPairs(oldVnodes, newVnodes) {
	const pairs = [];
	const set = new Set();

	for (let i = 0; i < newVnodes.length; i++) {
		const newVnode = newVnodes[i];
		const key = newVnode.attributes?.key;
		const oldVnode = key ? oldVnodes.find(x => x.attributes && x.attributes.key === key) : oldVnodes[i];
		pairs.push({ oldVnode, newVnode });

		if (oldVnode) {
			set.add(oldVnode);
		}
	}

	if (set.size < oldVnodes.length) {
		pairs.push(...oldVnodes.filter(x => !set.has(x)).map(x => ({ oldVnode: x })));
	}

	return pairs;
}

function updateAttributes(oldVnode, newVnode) {
	for (const propKey in oldVnode.attributes) {
		const isPropExist = propKey in newVnode.attributes;
		if (!isPropExist) {
			html.removeAttribute(oldVnode.domElement, propKey);
		}
	}

	for (const propKey in newVnode.attributes) {
		const oldValue = oldVnode.attributes[propKey];
		const newValue = newVnode.attributes[propKey];
		if (oldValue !== newValue) {
			html.setAttribute(oldVnode.domElement, propKey, newValue);
		}
	}

	oldVnode.attributes = newVnode.attributes;
}

function unmountComponents(vnode) { // Recursively
	if (vnode.childNodes) {
		for (const child of vnode.childNodes) {
			unmountComponents(child);
		}
	}

	if (vnode.instance && vnode.instance.componentWillUnmount) {
		vnode.instance.componentWillUnmount();
	}
}

function mountComponents(instances) {
	for (const instance of instances) {
		if (instance.componentDidMount) {
			instance.componentDidMount();
		}
	}
}

function normalizeVnode(vnode) {
	return (vnode.tagName) ? vnode : { text: vnode };
}

function getFullProps(props, children) {
	return (children.length) ? { ...props, children } : props;
}

/**
 * Creates a new QReact element. This function is typically used to create elements for rendering.
 *
 * @param {string|QReact.Component} src - The type of the element to create. It can be a string representing
 * a DOM tag (e.g., 'div', 'span'), a QReact component class or a functional component.
 *
 * @param {object} [props] - An object containing the properties and attributes
 * for the element. This can include event handlers, style, and other attributes.
 *
 * @param {...*} [children] - The children of the element, which can be any valid QReact node(s).
 * You can pass multiple children as additional arguments.
 *
 * @returns {
 * { text: string } |
 * { tagName: string, childNodes: Array<object>, attributes: Array<object>, events: Array<function>, instance: object }}
 * A new QReact element that can be rendered.
 */
function createElement(src, props, ...children) {
	if (src.prototype) { // Class component
		const fullProps = getFullProps(props, children);
		const instance = new src(fullProps);
		const vnode = instance.render();

		vnode.instance = instance;
		instance.vnode = vnode;

		return vnode;
	}

	if (typeof src === 'function') { // Function component
		const fullProps = getFullProps(props, children);
		return src(fullProps);
	}

	const attributes = {};
	const events = {};

	for (const propKey in props) {
		if (propKey.startsWith('on')) {
			const eventKey = propKey.substring(2).toLowerCase();
			events[eventKey] = props[propKey];
		} else {
			attributes[propKey] = props[propKey];
		}
	}

	const childNodes = children
		.flat()
		.filter(x => x !== null && x !== undefined && x !== '') // Values '0' and 'false' are valid, system should not ignore them
		.map(x => normalizeVnode(x));

	return {
		tagName: src,
		childNodes,
		attributes,
		events,
	};
}

/**
 * Initialize QReact.
 *
 * @param {QReact.Component} src - Root class component.
 *
 * @param {HTMLElement} rootElement - HTML element, that should be the container for QReact.
 */
function init(src, rootElement) {
	const oldVnode = { domElement: rootElement };
	const newVnode = QReact.createElement(src);
	update(oldVnode, newVnode);
}

/**
* Represents QReact component.
*/
class Component {
	constructor(props) {
		this.props = props;
	}

	/**
	* Updates the state of component. It tells that this component and its children need to re-render
	* with the new state. This is the main way you’ll update the user interface in response to interactions.
	*
	* @param {object} nextState - new state.
	*
	* @param {function} [callback] - An optional callback function that is executed once the state has been updated.
	* This is useful for performing actions after the state change has been applied.
	*/
	setState(nextState, callback, nextProps = this.props) {

		const noUpdate = this.shouldComponentUpdate && !this.shouldComponentUpdate(nextProps, nextState);
		if (noUpdate) {
			return;
		}

		this.state = nextState;
		this.props = nextProps;

		const oldVnode = this.vnode;
		const newVnode = this.render();

		newVnode.instance = this;

		update(oldVnode, newVnode);

		if (callback) {
			callback();
		}
	}
}

export const QReact = {
	Component,
	createElement,
	q: createElement, // Short form for ".babelrc"
	init,
	version: '0.8.2',
};