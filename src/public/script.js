const canvas = document.getElementById("timeline-canvas");
const ctx = canvas.getContext("2d");
const scrollbar = document.getElementById("scrollbar-wrapper");
const canvasw = document.getElementById("canvas-wrapper");
const labels = document.getElementById("labels");
const scroll = document.getElementById("scrollbar");
const keys = document.getElementById("keys");
const axis = document.getElementById("axis");
const options = document.getElementById("options");

var width = scrollbar.offsetWidth;
var height = labels.offsetHeight;
var vh = window.innerHeight * 0.01;
canvas.width = width;
canvas.height = height;

const label_odd_color = "#ffffff";
const label_even_color = "#f4f6fb";
const major_axis_line_color = "#e1e5ee";
const minor_axis_line_color = "#e1e5ee";
const track_node_color = "#4fc3f7"
const track_node_selected_color = "#0a99db";
const track_fill_selected_color = "#0a99db55";
const track_fill_color = "#4fc3f755";
const play_marker_color = "#a68b00";
// 
function update_dims() {
	width = scrollbar.scrollWidth;
	height = labels.offsetHeight;
	vh = window.innerHeight * 0.01;
	
	canvas.width = width;
	canvas.height = height;
	
	label_height = 5 * vh;
	axis_label_separation = 8 * vh;
	space_per_second = 8 * vh;
	major_axis_line_width = 0.2 * vh;
	minor_axis_line_width = 0.1 * vh;
	minor_lines_per_major_line = 5;
	track_start_offset = 0.5 * vh;
	track_size = label_height - 2 * track_start_offset;
	track_node_offset = 0.1 * vh;
	track_node_line_width = 0.2 * vh;
	track_node_radius = 0.4 * vh;
    play_marker_width = 0.2 * vh;
}

var label_height = 5 * vh;
var axis_label_separation = 8 * vh;
var space_per_second = 8 * vh;
var major_axis_line_width = 0.2 * vh;
var minor_axis_line_width = 0.1 * vh;
var minor_lines_per_major_line = 5;
var track_start_offset = 0.5 * vh;
var track_size = label_height - 2 * track_start_offset;
var track_node_offset = 0.1 * vh;
var track_node_line_width = 0.2 * vh;
var track_node_radius = 0.4 * vh;
var play_marker_width = 0.2 * vh;

var lights = [
    "Upper Top 1", "Upper Top 2", "Upper Top 3", "Upper Top 4", "Upper Top 5", 
    "Lower Top 1", "Lower Top 2", "Lower Top 3", "Lower Top 4", "Lower Top 5", "Lower Top 6", 
    "Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5", "Tip 6"
];
var tracks = [
	[0.8, 0.9, 0.75, 1, 0],
	[0.2, 0.8, 0.5, 1, 0],
	[0.2, 0.8, 0.5, 1, 0],
];
var starts = [1, 1.5, 5, 12, 13];
var times = [0.5, 0.5, 0.25, 0, 0.5];
var held = false;
var time = 0;
var play_held = false;
var held_node = -1;
var held_track = -1;
var selected_node = -1;
var selected_track = -1;
var current_time = time;

// ----------------------------- timeline operation -----------------------------  //

function reset_timeline() {
	set_lights(lights);
}
function rerender_timeline() {
	let save_scrollx = canvasw.scrollLeft;
	let save_scrolly = keys.scrollTop;
	time = Math.max(...starts) + 1;
	add_time(time);
	ctx.fillStyle = play_marker_color;
	ctx.fillRect(ti_to_xy(current_time)[0], 0, play_marker_width, canvas.height);
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
	nodes.unshift(0);
	starts.unshift(0);
	for (let i = 1; i < nodes.length; i++) {
		let last_node = nodes[i-1];
		let node = nodes[i];
		let starting = ti_to_xy(starts[i-1], last_node);
		let ending = ti_to_xy(starts[i-1] + times[i-1], node);
		ctx.beginPath();
		ctx.lineWidth = track_node_line_width;
		if (i != selected_node + 1) {
			ctx.strokeStyle = track_node_color;
			ctx.fillStyle = track_fill_color;
		}
		else {
			ctx.strokeStyle = track_node_selected_color;
			ctx.fillStyle = track_fill_selected_color;
		}
		ctx.moveTo(starting[0], starting[1] + v_offset);
		ctx.lineTo(ending[0], ending[1] + v_offset);
		ctx.lineTo(ti_to_xy(starts[i])[0], ending[1] + v_offset);
		ctx.stroke();
		ctx.lineTo(ti_to_xy(starts[i])[0], v_offset + label_height - track_start_offset);
		ctx.lineTo(starting[0], v_offset + label_height - track_start_offset);
		ctx.fill();
	}
	nodes.shift();
	starts.shift();
	for (let i = 0; i < nodes.length; i++) {
		draw_point(starts[i], nodes[i]);
	}
}
function search_node(nodes, light, x, y) {
	let v_offset = light * label_height;
	let bounds = xy_to_ti(track_node_radius * 1.5);
	let transformed = xy_to_ti(x, y - v_offset);
	for (let i = 0; i < nodes.length; i++) {
		let rect = [
			starts[i] - bounds[0], 
			starts[i] + bounds[0], 
			nodes[i] - track_node_radius * 1.5 / track_size,
			nodes[i] + track_node_radius * 1.5 / track_size
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
	for (let i = 0; i < tracks.length; i++) {
		let node = search_node(tracks[i], i, evt.offsetX, evt.offsetY, track_node_radius);
		if (node != -1) {
        	held = true;
			held_node = node;
			held_track = i;
		}
	}
	let distance_from_play = Math.abs(evt.offsetX - current_time * space_per_second);
	if (held_node == -1 && distance_from_play < 2 * vh) {
	    play_held = true;
	}
	else {
	    selected_node = held_node;
	    selected_track = held_track;
	}
	rerender_timeline();
});
canvas.addEventListener("mouseup", () => {
	held = false;
	play_held = false;
	held_node = -1;
	held_track = -1;
});
var canvas_left_right_client_loc, canvas_left_right_canvas_loc;
canvas.addEventListener("mousemove", (evt) => {
	let x = evt.offsetX, y = evt.offsetY;
	canvas_left_right_client_loc = evt.clientX;
	canvas_left_right_canvas_loc = evt.offsetX;
	let hovering = false, moving = false;
	for (let i = 0; i < tracks.length; i++) {
		let node = search_node(tracks[i], i, evt.offsetX, evt.offsetY, track_node_radius);
		if (node != -1) {
		    hovering = true;
		}
	}
	let distance_from_play = Math.abs(evt.offsetX - current_time * space_per_second);
	if (held_node == -1 && distance_from_play < 2 * vh) {
	    moving = true;
	}
	if (hovering) {
	    canvas.style.cursor = "pointer";
	}
	else if (moving) {
	    canvas.style.cursor = "col-resize";
	}
	else {
	    canvas.style.cursor = "default";
	}
	if (held && held_node != -1) {
		let wall_collide = (x, y) => {
			let last_node_coords, next_node_coords, next_uptime;
			next_uptime = 0;
			last_node_coords = [0]
			next_node_coords = [time];
			if (held_node != 0) {
				last_node_coords = [
					starts[held_node - 1], 
				];
			}
			if (held_node != tracks[held_track].length - 1) {
				next_node_coords = [
					starts[held_node + 1],
				];
				next_uptime = times[held_node + 1] * space_per_second;
			}
			last_node_coords = ti_to_xy(last_node_coords[0], 0);
			next_node_coords = ti_to_xy(next_node_coords[0], 0);

			let node_coords = tracks[held_track][held_node];
			let uptime = times[held_node] * space_per_second;
			node_coords = ti_to_xy(starts[held_node], node_coords);
			let collidex = Math.max(x, last_node_coords[0] + uptime);
			collidex = Math.min(collidex, next_node_coords[0] - next_uptime);
			console.log(collidex);
			let collidey = Math.max(y, held_track * label_height + track_start_offset);
			collidey = Math.min(collidey, (held_track+1)*label_height - track_start_offset);
            
            if (evt.altKey) {
                return [node_coords[0], collidey];
            }
            else if (evt.shiftKey) {
                return [collidex, node_coords[1]];
            }
			return [collidex, collidey];
		}
		
		let c = wall_collide(x, y);
		console.log(c);
		new_node = xy_to_ti(c[0], c[1] - (held_track * label_height));
		if (!evt.ctrlKey) {
		    new_node[0] = Math.ceil(new_node[0] * 10) / 10;
		    new_node[1] = Math.ceil(new_node[1] * 100) / 100;
		}
		starts[held_node] = new_node[0];
		tracks[held_track][held_node] = new_node[1];
		rerender_timeline();
	}
	else if (play_held) {
	    let play_t = xy_to_ti(x)[0];
	    current_time = Math.max(0, Math.min(play_t, time));
	    rerender_timeline();
	}
});
let autoscroll = setInterval(() => {
    if (held_node == -1) return;
	if (window.innerWidth - canvas_left_right_client_loc < 2 * vh) {
		canvasw.scrollLeft += vh;
	}
	if (canvas_left_right_client_loc - canvasw.getBoundingClientRect().left < 2 * vh) {
		canvasw.scrollLeft -= vh;
	}
})
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


