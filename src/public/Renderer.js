export class Renderer {

	constructor (updaters, globals, element_triggers, dependencies) {
		/*
		* updaters (readonly) - array of functions called on each update
		 	updater - takes a nonlocal state (object), a global state (object), 
		 		and dependencies (array) as parameters in that order
		* globals (readwrite) - object for global state sharing
		* element_triggers (readonly) - object where keys are elements and values are 
			triggers events for update method
		* dependencies (readonly) - array of Dependency objects passed into updaters
		*/

		this.dependencies = dependencies;
		this.updaters = updaters;
		this.update = this.update.bind(this);
		// persistent function state
		this.state = [];
		this.nonlocal = globals;
		updaters.forEach((updater) => this.state[updater[0]] = {});
		// load update triggers
		for (const [element, triggers] of Object.entries(element_triggers)) {
			triggers.forEach((trigger) => eval(element).addEventListener(trigger, this.update));
		}
	}

	update() {
		this.dependencies.forEach((dependency) => dependency.update());
		this.updaters.forEach((updater, i) => {
			updater[1](this.state[updater[0]], this.nonlocal, this.dependencies);
		});
	}
	
}

export class ElementEvent {
	
	constructor(element, handlers, globals, dependencies) {
		/*
		* element (readonly) - DOM element object to listen for events on
		* handlers (readonly) - object where keys are events and values are functions 
		* 	called on the event
		* 	handler - takes a global state (object) and dependencies (array) as
		* 	parameters in that order
		* globals (readwrite) - object for global state sharing
		* dependencies (readonly) - array of Dependency objects as passed into handlers
		*/

		this.element = element;
		this.handlers = handlers;
		this.globals = globals;
		this.dependencies = dependencies;
	}

	load() {
		for (const [evt, handler] of Object.entries(this.handlers)) {
			this.element.addEventListener(evt, () => 
				handler(this.globals, this.dependencies)
			);
		}
	}
	
}

export class Dependency {
	
	constructor(statics) {
		this.statics = statics;
		this.dynamics = {};
	};
	
	update() {
		this.dynamics = this.statics;
	}
	
	query(property) {
		// dynamically query property values
		this.update();
		let query_result = this.dynamics[property];
		return (query_result === undefined) ? -1 : query_result;
	}
	
}

export class Length extends Dependency {
	
	constructor(statics) {
		super(statics);
	}
	
	update() {
		const update_field = (field, unit) => {
			if (typeof field === "number") {
				return field * unit;
			}
			else if (field.forEach) {
				let return_field = [];
				field.forEach((value, index) => {
					return_field.push(update_field(value, unit));
				});
				return return_field;
			}
			else {
				return field;
			}
		}
		// dynamically update length
		for (const [unit, property_lengths] of Object.entries(this.statics)) {
			let u = eval(unit);
			for (const [property, length] of Object.entries(property_lengths)) {
				this.dynamics[property] = update_field(length, u);
			}
		}
	}
	
}

export class Element extends Dependency {
	
	constructor(statics) {
		super(statics);
	}

	update() {
		for (const [key, id] of Object.entries(this.statics)) {
			const all_selectors = document.querySelectorAll(id);
			if (all_selectors.length != 1) {
				this.dynamics[key] = all_selectors;
			}
			else {
				this.dynamics[key] = all_selectors[0];
			}
		}
	}

}
