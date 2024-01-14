import { Renderer, ElementEvent, Dependency, Length, Element } from "./Renderer.js";
import { Cue, Time } from "./Cues.js";

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

const zero = new Cue(new Time(0), new Time(0), 0, "", dependencies);

let global = {
	"cues": [
		new Cue(new Time(1), new Time(0.5), 0, "", dependencies, [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
	]
};

globalThis.global = global;
globalThis.dependencies = dependencies;

let data_updaters = [
	["cue sorting", "sort cues into chronological order", (s, g, d) => {
		Cue.sort(g["cues"], d);
	}],
	["time synchronization", "recalculate max time", (s, g, d) => {
		g["timeline time"] = g["cues"].at(-1).time;
	}]
];

let timeline_updaters = [
	["viewport synchronization", "save scroll status", (s, g, d) => {
		s["scroll x"] = d[0].query("canvas x scroll");
		s["scroll y"] = d[0].query("canvas y scroll");
	}],
	["clear canvas", "", (s, g, d) => {
		d[2].query("canvas").width = d[0].query("canvas width");
		d[2].query("canvas").height = d[0].query("canvas height");
	}],
	["draw timeline", "setup drawing contexts", (s, g, d) => {
		s["seconds"] = Array(Math.floor(g["timeline time"].time) + 1).fill();
		s["context"] = d[2].query("canvas").getContext("2d");
		s["reset element"] = (e) => e.replaceChildren();
	}],
	["draw timeline", "rebuild list elements per frame", (s, g, d) => {
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
	["draw timeline", "draw axis lines", (s, g, d) => {
		s["reset element"](d[2].query("scrollbar"));
		s["context"].fillStyle = d[1].query("gray300");
		s["seconds"].forEach((_, i) => {
			const left_offset = i * d[0].query("axis label separation");
			d[2].query("scrollbar").innerHTML += 
				`<p style='left: ${left_offset}px'>
					${(new Time(i)).to_string()} 
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
	["draw nodes", "", (s, g, d) => {
		s["contexts"] = [];
		d[1].query("lights").forEach((_, i) => {
			s["contexts"].push(d[2].query("canvas").getContext("2d"));
			s["contexts"][i].beginPath();
		});
		zero.get_xy().forEach((c, i) => {
			s["contexts"][i].moveTo(c[0], c[1]);
			console.log(c);
		});
		g["cues"].forEach((cue, i) => {
			const xys = cue.get_xy();
			xys.forEach((c, j) => {
				s["contexts"][i].lineTo(c[0], c[1]);
			});
		});
		d[1].query("lights").forEach((_, i) => {
			s["contexts"][i].stroke();
		});
	}],
	["viewport synchronization", "resync scroll values", (s, g, d) => {
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
