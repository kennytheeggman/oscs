
class RenderManager {

	constructor (dependencies, events) {
		this.dependencies = dependencies;
		this.events = events;
	}
	
}

class EventManager {
	
	constructor(element, event, handler) {
		this.element = element;
		this.event = event;
		this.handler = handler;
	}
	
}

class DependencyManager {
	
	constructor(statics) {
		this.statics = statics;
		this.dynamics = {};
	};
	
	update() {
		this.dynamics = this.statics;
	}
	
	query(property) {
		// dynamically query property values
		update();
		let query_result = this.dynamics[property];
		return (query_result === undefined) ? -1 : query_result;
	}
	
}

class LengthManager extends DependencyManager {
	
	constructor(statics) {
		super(statics);
	}
	
	update() {
		// dynamically update length
		for (const length in this.statics) {
			let unit = eval(length);
			for (const property in this.statics[length]) {
				this.dynamics[property] = (this.statics[length][property] * unit);
			}
		}
	}
	
}