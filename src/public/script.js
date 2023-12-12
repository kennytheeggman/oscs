const canvas = document.getElementById("timeline-canvas");
const ctx = canvas.getContext("2d");
const scrollbar = document.getElementById("scrollbar-wrapper");
const canvasw = document.getElementById("canvas-wrapper");
const labels = document.getElementById("labels");
const scale = document.getElementById("scale-canvas");
const stx = scale.getContext("2d");
const scroll = document.getElementById("scrollbar");
const keys = document.getElementById("keys");
const axis = document.getElementById("axis");
const options = document.getElementById("options");

var width = scrollbar.offsetWidth;
var height = labels.offsetHeight;
var vh = window.innerHeight * 0.01;
canvas.width = width;
scale.width = width;
canvas.height = height;

function update_dims() {
	width = scrollbar.scrollWidth;
	height = labels.offsetHeight;
	vh = window.innerHeight * 0.01;
	
	canvas.width = width;
	scale.width = width;
	canvas.height = height;
	
	zoomlevel = 1; // 10px = 1s; markers every 10s;
	zoomscale = 1;
	label_height = 5 * vh;
	label_odd_color = "#ffffff";
	label_even_color = "#f4f6fb";
	axis_label_separation = 8 * vh;
	space_per_second = 8 * vh;
	major_axis_line_color = "#e1e5ee";
	minor_axis_line_color = "#e1e5ee";
	major_axis_line_width = 0.2 * vh;
	minor_axis_line_width = 0.1 * vh;
	minor_lines_per_major_line = 5;
	track_node_color = "#4fc3f7";
	track_start_offset = 0.5 * vh;
	track_size = label_height - 2 * track_start_offset;
	track_node_offset = 0.1 * vh;
	track_node_line_width = 0.2 * vh;
	track_node_radius = 0.4 * vh;
}

var zoomlevel = 1; // 10px = 1s; markers every 10s;
var zoomscale = 1;
var label_height = 5 * vh;
var label_odd_color = "#ffffff";
var label_even_color = "#f4f6fb";
var axis_label_separation = 8 * vh;
var space_per_second = 8 * vh;
var major_axis_line_color = "#e1e5ee";
var minor_axis_line_color = "#e1e5ee";
var major_axis_line_width = 0.2 * vh;
var minor_axis_line_width = 0.1 * vh;
var minor_lines_per_major_line = 5;
var track_node_color = "#4fc3f7";
var track_start_offset = 0.5 * vh;
var track_size = label_height - 2 * track_start_offset;
var track_node_offset = 0.1 * vh;
var track_node_line_width = 0.2 * vh;
var track_node_radius = 0.4 * vh;

var lights = ["One", "Two", "Three", "Four", "Five"];
var tracks = [
	[[1, 0.8, 0.5], [1.5, 0.9, 0.5], [5, 0.75, 0.5], [12, 1, 0.5], [13, 0, 0.5]],
	[[1, 0.2, 0.5], [1.5, 0.8, 0.5], [5, 0.5, 0.5], [12, 1, 0.5], [13, 0, 0.5]],
	[[1, 0.2, 0.5], [1.5, 0.8, 0.5], [5, 0.5, 0.5], [12, 1, 0.5], [13, 0, 0.5]],
];
var time = 30;
var held = false;
var held_node = -1;
var held_track = -1;
var selected_node = -1;
var selected_track = -1;

function reset_timeline() {
	set_lights(lights);
}
function rerender_timeline() {
	let save_scrollx = canvasw.scrollLeft;
	let save_scrolly = keys.scrollTop;
	add_time(time);
	for (let i = 0; i < tracks.length; i++) {
		add_track(tracks[i], i); 
	}
	canvasw.scrollLeft = save_scrollx;
	scrollbar.scrollLeft = save_scrollx;
	keys.scrollTop = save_scrolly;
}
// depends on: 	label_odd_color, label_even_color, label_height, update_dims
function set_lights(lights) {
	labels.replaceChildren();
	for (name of lights) {
		let p = document.createElement("p");
		p.innerHTML = name;
		labels.appendChild(p);
	}
	update_dims();
	for (let i = 0; i < lights.length; i++) {
		if (i % 2 == 0) {
			ctx.fillStyle = label_odd_color;
		}
		else {
			ctx.fillStyle = label_even_color;
		}
		ctx.fillRect(0, i * label_height, canvas.width, label_height);
	}
}
// depends on: 	axis_label_separation, minor_lines_per_major_line, minor_axis_line_color, 
// 		minor_axis_line_width, major_axis_line_color, major_axis_line_width
function add_time(t) {
	scrollbar.replaceChildren(scroll);
	update_dims();
	for (var i = 0; i < t; i++) {
		p = document.createElement('p');
		p.innerHTML = "0:" + i.toString().padStart(2, '0') + ".00";
		let left_off = i * axis_label_separation;
		p.style.left = left_off + "px";
		scrollbar.appendChild(p);
	}
	reset_timeline();
	for (var i = 0; i < t * minor_lines_per_major_line; i++) {
		let left_off = i * axis_label_separation / minor_lines_per_major_line;
		ctx.fillStyle = minor_axis_line_color;
		ctx.fillRect(left_off, 0, minor_axis_line_width, canvas.height);
	}
	for (var i = 0; i < t; i++) {
		let left_off = i * axis_label_separation;
		ctx.fillStyle = major_axis_line_color;
		ctx.fillRect(left_off, 0, major_axis_line_width, canvas.height);
	}
}
// depends on:	label_height, track_node_color, track_node_radius, track_node_line_width, ti_to_xy
function add_track(nodes, light) {
	let v_offset = light * label_height;
	let draw_point = (t, i) => {
		let c = ti_to_xy(t, i);
		ctx.beginPath();
		ctx.lineWidth = track_node_line_width;
		ctx.strokeStyle = track_node_color;
		if (light % 2 == 0) {
			ctx.fillStyle = label_odd_color;
		}
		else {
			ctx.fillStyle = label_even_color;
		}
		ctx.arc(c[0], c[1] + v_offset, track_node_radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
	nodes.unshift([0, 0]);
	for (let i = 1; i < nodes.length; i++) {
		let last_node = nodes[i-1];
		let node = nodes[i];
		let starting = ti_to_xy(last_node[0], last_node[1]);
		let ending = ti_to_xy(last_node[0] + node[2], node[1]);
		let norm = normalize(ending[0] - starting[0], ending[1] - starting[1]);
		if (i > 1) {
			starting[0] = starting[0] + norm[0] * track_node_radius;
			starting[1] = starting[1] + norm[1] * track_node_radius;
		}
		ctx.beginPath();
		ctx.lineWidth = track_node_line_width;
		ctx.strokeStyle = track_node_color;
		ctx.moveTo(starting[0], starting[1] + v_offset);
		ctx.lineTo(ending[0], ending[1] + v_offset);
		ctx.lineTo(ti_to_xy(node[0])[0] - track_node_radius, ending[1] + v_offset);
		ctx.stroke();
	}
	nodes.shift();
	for (node of nodes) {
		draw_point(node[0], node[1]);
	}
}
function search_node(nodes, light, x, y) {
	let v_offset = light * label_height;
	let bounds = xy_to_ti(track_node_radius);
	let transformed = xy_to_ti(x, y - v_offset);
	for (let i = 0; i < nodes.length; i++) {
		let rect = [
			nodes[i][0] - bounds[0], 
			nodes[i][0] + bounds[0], 
			nodes[i][1] - track_node_radius / track_size,
			nodes[i][1] + track_node_radius / track_size
		];
		let withinx = transformed[0] >= rect[0] && transformed[0] <= rect[1];
		let withiny = transformed[1] >= rect[2] && transformed[1] <= rect[3];
		if (withinx && withiny) {
			return i;
		}
	}
	return -1;
}
// depends on: space_per_second, track_start_offset, track_node_offset
function ti_to_xy(t, i) {
	return [t * space_per_second + track_node_offset, 
		(1-i) * track_size + track_start_offset];
}
function xy_to_ti(x, y) {
	return [(x - track_node_offset) / space_per_second,
		(track_start_offset - y) / track_size + 1]
}
function normalize(relx, rely) {
	let d = relx * relx + rely * rely;
	let ux = relx / Math.sqrt(d), uy = rely / Math.sqrt(d);
	return [ux, uy];
} 
canvas.addEventListener("mousedown", (evt) => {
	held = true;
	for (let i = 0; i < tracks.length; i++) {
		let node = search_node(tracks[i], i, evt.offsetX, evt.offsetY, track_node_radius);
		if (node != -1) {
			held_node = node;
			held_track = i;
			selected_node = node;
			selected_track = i;
		}
	}
});
canvas.addEventListener("mouseup", () => {
	held = false;
	held_node = -1;
	held_track = -1;
});
canvas.addEventListener("mousemove", (evt) => {
	let x = evt.offsetX, y = evt.offsetY;
	if (held && held_node != -1) {
		let wall_collide = (x, y) => {
			let last_node_coords, next_node_coords;
			last_node_coords = [0, 0, 0];
			next_node_coords = [time, 0, 0];
			if (held_node != 0) {
				last_node_coords = tracks[held_track][held_node - 1];
			}
			if (held_node != tracks[held_track].length - 1) {
				next_node_coords = tracks[held_track][held_node + 1];
			}
			let next_uptime = next_node_coords[2] * space_per_second;
			last_node_coords = ti_to_xy(last_node_coords[0], last_node_coords[1]);
			next_node_coords = ti_to_xy(next_node_coords[0], next_node_coords[1]);

			let node_coords = tracks[held_track][held_node];
			let uptime = node_coords[2] * space_per_second;
			node_coords = ti_to_xy(node_coords[0], node_coords[1]);
			let collidex = Math.max(x, last_node_coords[0] + uptime);
			collidex = Math.min(collidex, next_node_coords[0] - next_uptime);
			let collidey = Math.max(y, held_track * label_height + track_start_offset);
			collidey = Math.min(collidey, (held_track+1)*label_height - track_start_offset);

			return [collidex, collidey];
		}
		
		let c = wall_collide(x, y);
		new_node = xy_to_ti(c[0], c[1] - (held_track * label_height));
		for (let i = 0; i < tracks.length; i++) {
			tracks[i][held_node][0] = new_node[0];
		}
		tracks[held_track][held_node][1] = new_node[1];
		rerender_timeline();
	}
});
rerender_timeline();
// timeline scrolling 
scrollbar.onscroll = () => {
	canvasw.scrollLeft = scrollbar.scrollLeft;
}
canvasw.onscroll = () => {
	scrollbar.scrollLeft = canvasw.scrollLeft;
}
keys.onscroll = () => {
	if (keys.scrollTop == 0) {
		axis.style.boxShadow = "none";
		options.style.boxShadow = "0 1vh 1vh var(--gray200)";
	}
	else {
		axis.style.boxShadow = "0 1vh 1vh var(--gray200)";
		options.style.boxShadow = "none";
	}
}
window.onresize = () => { update_dims; rerender_timeline(); };


