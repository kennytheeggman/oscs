import { Renderer, ElementEvent, Dependency, Length, Element } from "./Renderer.js";
class Cue {

	constructor(time, fade, number, description, dependencies, intensities, colors) {
		this.time = time;
		this.fade = fade;
		this.number = number,
		this.description = description;
		
		let default_intensity = [], default_colors = [];
		dependencies[1].query("lights").forEach(() => {
			default_intensity.push(0);
			default_colors.push(dependencies[1].query("gray00"));
		});
		this.d = dependencies;

		this.intensities = (intensities) ? intensities : default_intensity;
		this.colors = (colors) ? colors : default_colors;
	}

	static sort(cues, d) {
		let sorting_function = (a, b) => a.time - b.time;
		cues.sort(sorting_function);
		cues.forEach((cue, i) => { cue.number = i / 10 + d[1].query("starting cue number") });
	}

	get_xy() {
		let return_xy_list = [];
		this.intensities.forEach((intensity, i) => {
			return_xy_list.push([
				this.time * this.d[0].query("space per second") 
					+ this.d[0].query("track node offset"),
				(1 - intensity) * this.d[0].query("track size") 
					+ this.d[0].query("track start offset")
			]);
		})
		return return_xy_list;
	}
	get_track(coordinate, distance) {
		this.get_xy().forEach((c, track) => {
			const deltax = (c[0] - coordinate[0]);
			const deltay = (c[1] - coordinate[1]);
			if (deltax * deltax + deltay * deltay <= distance * distance) {
				return track;
			}
		});
		return -1;
	}

}

class Time {
	
	constructor(time) {
		this.time = time;
	}

	to_string(hide_hundredths) {
		const minutes = Math.floor(this.time / 60);
		const seconds = Math.floor(this.time) % 60;
		const hundredths = Math.round((this.time - Math.floor(this.time)) * 100) / 100;

		return minutes.toString().padStart(1, "0") + 
			":" + seconds.toString().padStart(2, "0") + 
			((hide_hundredths) ? ("." + hundredths.toString().padStart(2, "0")) : "");
	}

}


async function get_config(url) {
	const response = await fetch(url);
	const json = await response.json();
	return json;
}


const properties = await get_config("./config.json");
let dependencies = [
	new Length(properties["length"]),
	new Dependency(properties["dependency"]),
	new Element(properties["element"])
];

let global = {
	"cues": [
		new Cue(new Time(1), new Time(0.5), 0, "", dependencies)
	]
};

globalThis.global = global;
globalThis.dependencies = dependencies;

let data_updaters = [
	["cue sorting", (s, g, d) => {
		Cue.sort(g["cues"], d);
	}],
	["time synchronization", (s, g, d) => {
		g["timeline time"] = g["cues"].at(-1).time;
	}]
];

let timeline_updaters = [
	["viewport synchronization", (s, g, d) => {
		s["scroll x"] = d[0].query("canvas x scroll");
		s["scroll y"] = d[0].query("canvas y scroll");
	}],
	["clear canvas", (s, g, d) => {
		d[2].query("canvas").width = d[0].query("canvas width");
		d[2].query("canvas").height = d[0].query("canvas height");
	}],
	["draw timeline", (s, g, d) => {
		s["seconds"] = Array(Math.floor(g["timeline time"].time)).fill();
		s["context"] = d[2].query("canvas").getContext("2d");
		s["reset element"] = (e) => e.replaceChildren();
	}],
	["draw timeline", (s, g, d) => {
		s["reset element"](d[2].query("label"));
		d[1].query("lights").forEach((name, i) => {
			d[2].query("label").innerHTML += `<p>${name}</p>`;
			s["context"].fillStyle = (i % 2 == 0) ?
				d[1].query("gray00") : d[1].query("gray150");
			s["context"].fillRect(
				0, i * d[0].query("label height"),
				d[0].query("canvas width"), d[0].query("label height")
			);
		});
	}],
	["draw timeline", (s, g, d) => {
		s["reset element"](d[2].query("scrollbar"));
		s["context"].fillStyle = d[1].query("gray300");
		s["seconds"].forEach((_, i) => {
			const left_offset = i * d[1].query("axis label separation");
			d[2].query("scrollbar").innerHTML += 
				`<p style='left: ${left_offset}'>
					${g["timeline time"].to_string()} 
				<p>\n`;
			s["context"].fillRect(left_offset, 0,
				d[0].query("major axis line width"), d[0].query("canvas height")
			);
			for (let j = 0; j < 1; j += 1 / d[1].query("minor lines per major line")) {
				const min_left_off = (i + j) * d[0].query("axis label separation");
				s["context"].fillRect(min_left_off, 0,
					d[0].query("minor axis line width"), d[0].query("canvas height")
				);
			}
		});
	}],
	["viewport synchronization", (s, g, d) => {
		d[2].query("scrollbar").scrollLeft = s["scroll x"];
		d[2].query("canvas wrapper").scrollLeft = s["scroll x"];
		d[2].query("keys").scrollTop = s["scroll y"];
	}]
];

console.log(dependencies[0].query("tip"));



let timeline_renderer = new Renderer(
	data_updaters.concat(timeline_updaters),
	global,
	{ "document": ["mousemove"] },
	dependencies
);

globalThis.timeline_renderer = timeline_renderer;
