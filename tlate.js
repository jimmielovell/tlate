'use strict';

export default class Tlate {
	static render(template, data) {
		if (data) {
			if (Object.prototype.toString.call(data) == '[object Array]') {
				let templates = [];

				data.forEach(obj=>{
					templates.push(this.render(template, obj));
				});

				template = templates.join('');
			} else {	
				if (Object.prototype.toString.call(data) != '[object Object]') {
					throw TypeError('The data must be an [Object] or an [Array] containing values of type [Object]');
				}

				let _variables = this.__findVariables(template);

				_variables.forEach(_variable=>{
					const replaced = _variable[1];
					let prop = _variable[2];
					let replacement = '';

					if (prop) { replacement = data[prop] ? data[prop] : 'Undefined' }

					template = template.replace(replaced, replacement);
				});
			}
		}

		return template;
	}

	static renderFromURL(url, data, fromDefaultDir = true) {
		if (fromDefaultDir) { url = '/tlates/' + url }

		return fetch(url)
			.then(response=>response.text())
			.then(text=>this.render(text, data))
			.catch(err=>{console.log(err)})
	}

	static require(fileurl, {parent, sibling, position}, options) {
		this.renderFromURL(fileurl, options, false)
			.then(template=>{
				this.insertHTML(template, {
					parent: parent || document.body,
					position: position || 'beforeend'
				});
			});
	}

	static insertHTML(template, {parent, sibling, position}) {
		const NODE_POSITIONS = ['beforebegin', 'afterbegin', 'beforeend', 'afterend'];
		let _position = !position || !NODE_POSITIONS.includes(position) ? 'afterbegin' : position;
		let adjacentNode;

		if (sibling && sibling !== null) {
			adjacentNode = sibling;

			if (_position == 'afterbegin') {
				_position = 'afterend';
			} else if (_position == 'beforeend') {
				_position = 'beforebegin';
			}
		} else {
			if (parent && parent !== null) {
				adjacentNode = parent;
			} else {
				throw Error('The node to which the template is inserted must be provided');
			}
		}

		adjacentNode.insertAdjacentHTML(_position, template);
	}

	static __findVariables(template) {
		return [...template.matchAll(/({{([a-z0-9_]*)}})/gi)];
	}
}
