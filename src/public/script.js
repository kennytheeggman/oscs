const canvas = document.getElementById("timeline-canvas");
const ctx = canvas.getContext("2d");
const scrollbar = document.getElementById("scrollbar-wrapper");
const canvasw = document.getElementById("canvas-wrapper");
const labels = document.getElementById("labels");
const scroll = document.getElementById("scrollbar");
const keys = document.getElementById("keys");
const axis = document.getElementById("axis");
const options = document.getElementById("options");
const cues = document.getElementById("cues");
const player_tracker = document.getElementById("time");
const add_button = document.getElementById("add");
const close_editor_button = document.getElementById("close-editor");
const editor = document.getElementById("editor");
const fade_up_input = document.getElementById("timeup");
const end_time_input = document.getElementById("follow");

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
	"Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5", "Tip 6",
	"Follow 1", "Follow 2"
];
var tracks = [
	[0.8, 0.9, 0.75, 1, 0],
	[0.2, 0.8, 0.5, 1, 0],
	[0.2, 0.8, 0.5, 1, 0],
];
var starts = [1, 1.5, 5, 12, 13];
var times = [0.5, 0.5, 0.25, 0, 0.5];
var numbers = [1.1, 1.2, 1.3, 2, 3];
var descriptions = ["test1", "test2", "test3", "test4", "test5"];
var held = false;
var time = 1;
var play_held = false;
var held_node = -1;
var held_track = -1;
var selected_node = -1;
var selected_track = -1;
var current_time = time-1;

// ----------------------------- cue list operation -----------------------------  //

function set_cues(numbers, descriptions, times, starts) {
	cues.replaceChildren();
	let format_time = (dec) => {
		let dp = Math.round((dec - Math.floor(dec)) * 100);
		let s = Math.floor(dec) % 60;
		let m = Math.floor(Math.floor(dec) / 60);
		return m + ":" + s.toString().padStart(2, "0") + "." + dp.toString().padStart(2, "0");
	}
	for (let i = 0; i < numbers.length; i++) {
		let number = numbers[i];
		let description = descriptions[i];
		let fade = times[i];
		
		let last_time = (i == 0) ? 0 : starts[i-1];
		let duration = starts[i] - last_time * 0;

		let div;
		
		div = document.createElement("div");
		div.innerHTML += "<p>" + number + "</p>";
		div.innerHTML += "<p>" + description + "</p>";
		div.innerHTML += "<p>" + format_time(fade) + "</p>";
		div.innerHTML += "<p>" + format_time(duration) + "</p>";

		cues.appendChild(div);
	}
}
var after_dec = false;
var after_dec_2 = false;

close_editor_button.onclick = () => {
	editor.style.transform = "translate(100%, 0)";
	selected_node = -1;
	selected_track = -1;
	rerender_timeline();
}
player_tracker.onclick = (evt) => {
	player_tracker.value = "0:00.00";
	player_tracker.setSelectionRange(4, 4);
	current_time = 0;
	after_dec = false;
	after_dec_2 = false;
	rerender_timeline();
};
player_tracker.addEventListener("input", (evt) => { 
	let new_time = handle_time_input(evt); 	

	new_time = Math.min(new_time, time);

	// current_string = min + ":" + sec + "." + dec;
	// player_tracker.value = current_string;
	current_time = new_time;
	rerender_timeline();
});
fade_up_input.onclick = () => {
	fade_up_input.value = "0:00.00";
	fade_up_input.setSelectionRange(4, 4);
	after_dec = false;
	after_dec_2 = false;
	times[selected_node] = 0;
	rerender_timeline();
}
fade_up_input.oninput = (evt) => {
	let last_start = (selected_node == 0) ? 0 : starts[selected_node - 1];
	let current_start = starts[selected_node];
	let follow = current_start - last_start;

	let new_time = handle_time_input(evt);
	new_time = Math.min(new_time, follow);
	let min = Math.floor((new_time) / 60).toString().padStart(1, "0");
	let sec = (Math.floor(new_time) % 60).toString().padStart(2, "0");
	let dec = Math.round(((new_time) - Math.floor(new_time)) * 100).toString().padStart(2, "0");
	fade_up_input.value = min + ":" + sec + "." + dec;
	fade_up_input.setSelectionRange(4, 4);
	if (selected_node != -1) {
		times[selected_node] = new_time;
	}
	rerender_timeline();
};
end_time_input.onclick = () => {
	last_eligible_end = starts[selected_node];
	end_time_input.value = "0:00.00";
	temp_start = 0;
	after_dec = false;
	after_dec_2 = false;
	starts[selected_node] = (check_end_eligibility(0)) ? 0 : starts[selected_node];
	rerender_timeline();
	end_time_input.setSelectionRange(4, 4);
}
var temp_start = starts[0], last_eligible_end = starts[0];
end_time_input.oninput = (evt) => {
	last_eligible_end = starts[selected_node];
	let new_time = handle_time_input(evt) 
	console.log(new_time);	
	temp_start = new_time;
	if (check_end_eligibility(new_time)) {
		last_eligible_end = new_time;	
		temp_start = last_eligible_end;
	}
	let min = Math.floor((new_time) / 60).toString().padStart(1, "0");
	let sec = (Math.floor(new_time) % 60).toString().padStart(2, "0");
	let dec = Math.round(((new_time) - Math.floor(new_time)) * 100).toString().padStart(2, "0");
	end_time_input.value = min + ":" + sec + "." + dec;
	if (selected_node != -1) {
		starts[selected_node] = last_eligible_end;
	}
	rerender_timeline();
	end_time_input.setSelectionRange(4, 4);
};
end_time_input.onchange = (evt) => {
	temp_start = last_eligible_end;
	console.log(temp_start);
	rerender_timeline();
}
function check_end_eligibility(t) {
	let eligible = true;
	for (let i = 1; i < starts.length; i++) {
		if (i == selected_node) {
			continue;
		}
		if (t - starts[i-1] < times[selected_node] && t >= starts[i-1]) {
			eligible = false;
		}
		else if (starts[i] - t < times[i] && t <= starts[i]) {
			eligible = false;
		}
	}
	if (t < times[0]) {
		eligible = false;
	}
	return eligible;
}
function handle_time_input(evt) {
	let cursor_position = Math.max(evt.target.selectionEnd, evt.target.selectionStart);
	let current_string = evt.target.value;
	if (current_string.length < 7) {
		evt.target.value = "0:00.00";
		after_dec = false;
		after_dec_2 = false;
		evt.target.setSelectionRange(4, 4);
		rerender_timeline();
		return 0;
	}
	let new_chars = current_string.substring(4, cursor_position);
	new_chars.replaceAll(":", "");
	let td = new_chars.split(".");
	let min, sec, dec;
	if (new_chars.length == 1) {
		if (new_chars == ".") {
			after_dec = true;
			current_string = current_string.replaceAll(":", "").replaceAll(".", "");
			min = current_string.substring(0, 1);
			sec = current_string.substring(1, 3);
			dec = current_string.substring(3);
		}
		else if (!after_dec && !after_dec_2) {
			current_string = current_string.replaceAll(":", "").replaceAll(".", "");
			current_string = current_string.substring(1);
			min = current_string.substring(0, 1);
			sec = current_string.substring(1, 3);
			dec = current_string.substring(3);
		}
		else if (after_dec) {
			current_string = current_string.replaceAll(":", "").replaceAll(".", "");
			current_string = current_string.substring(0, 4) + current_string.substring(5);
			min = current_string.substring(0, 1);
			sec = current_string.substring(1, 3);
			dec = current_string.substring(3);
			after_dec = false;
			after_dec_2 = true;
		}
		else if (after_dec_2) {
			current_string = current_string.replaceAll(":", "").replaceAll(".", "");
			current_string = current_string.substring(0, 3) + current_string.substring(4, 5) + current_string.substring(3, 4);
			min = current_string.substring(0, 1);
			sec = current_string.substring(1, 3);
			dec = current_string.substring(3);
			after_dec_2 = false;
		}
	}
	else {
		if (td.length == 1) {
			sec = new_chars.substring(new_chars.length - 2).padStart(2, "0");
			min = new_chars.substring(new_chars.length - 3, new_chars.length - 2).padStart(1, "0");
			dec = "00"
		}
		else if (td.length == 2) {
			sec = td[0].substring(new_chars.length - 2).padStart(2, "0");
			min = td[0].substring(new_chars.length - 3, new_chars.length - 2).padStart(1, "0");
			dec = td[1].substring(2).padStart(2, "0");
		}
		else {
			let running_dec = "";
			for (let i = 1; i < td.length; i++) {
				running_dec += td[i];
			}
			sec = td[0].substring(new_chars.length - 2).padStart(2, "0");
			min = td[0].substring(new_chars.length - 3, new_chars.length - 2).padStart(1, "0");
			dec = running_dec.substring(2).padStart(2, "0");
		}
	}
	let new_time = parseInt(min) * 60 + parseInt(sec) + parseInt(dec) / 100;
	evt.target.setSelectionRange(4, 4);
	return new_time;
}
function sync_current_time() {
	time = Math.max(...starts) + 1;
	add_time(time);
	let min = Math.floor((current_time) / 60).toString().padStart(1, "0");
	let sec = (Math.floor(current_time) % 60).toString().padStart(2, "0");
	let dec = Math.round(((current_time) - Math.floor(current_time)) * 100).toString().padStart(2, "0");
	player_tracker.value = min + ":" + sec + "." + dec;
	player_tracker.setSelectionRange(4, 4);
}
function add_cue_eligible() {
	let eligible = true;
	for (let i = 0; i < starts.length - 1; i++) {
		let lowerbound = starts[i];
		let upperbound = starts[i] + times[i + 1];
		if (current_time >= lowerbound && current_time <= upperbound) {
			eligible = false;
		}
	}
	if (current_time <= times[0]) {
		eligible = false;
	}
	if (current_time == starts[starts.length - 1]){
		eligible = false;
	}
	
	if (eligible) {
		add_button.removeAttribute("disabled");
	}
	else {
		add_button.setAttribute("disabled", "");
	}
}
function open_editor(cue) {
	if (cue == -1) {
		editor.style.transform = "translate(100%, 0)";
		return;
	}
	editor.style.transform = "";
	let color_inputs = document.querySelectorAll('div.lighting>input[type="color"]');
	let intensity_inputs = document.querySelectorAll('div.lighting>input[type="number"]');
	
	let header_text = document.getElementById("header-text");
	let cue_number_input = document.getElementById("cuenum");
	let description_input = document.getElementById("desc");
	let fade_time_input = document.getElementById("timeup");
	let end_time_input = document.getElementById("follow");

	cue_number_input.value = numbers[cue];
	description_input.value = descriptions[cue];
	header_text.innerHTML = "Cue " + numbers[cue] + " - " + descriptions[cue];
	
	let fmin = Math.floor((times[cue]) / 60).toString().padStart(1, "0");
	let fsec = (Math.floor(times[cue]) % 60).toString().padStart(2, "0");
	let fdec = Math.round(((times[cue]) - Math.floor(times[cue])) * 100).toString().padStart(2, "0");

	let emin = Math.floor((temp_start) / 60).toString().padStart(1, "0");
	let esec = (Math.floor(temp_start) % 60).toString().padStart(2, "0");
	let edec = Math.round(((temp_start) - Math.floor(temp_start)) * 100).toString().padStart(2, "0");

	fade_time_input.value = fmin + ":" + fsec + "." + fdec;
	end_time_input.value = emin + ":" + esec + "." + edec;
	
}


// ----------------------------- timeline operation -----------------------------  //

function reset_timeline() {
	set_lights(lights);
}
function rerender_timeline() {
	let save_scrollx = canvasw.scrollLeft;
	let save_scrolly = keys.scrollTop;
	sync_current_time();
	ctx.fillStyle = play_marker_color;
	ctx.fillRect(ti_to_xy(current_time)[0], 0, play_marker_width, canvas.height);
	for (let i = 0; i < tracks.length; i++) {
		add_track(tracks[i], i); 
	}
	canvasw.scrollLeft = save_scrollx;
	scrollbar.scrollLeft = save_scrollx;
	keys.scrollTop = save_scrolly;
	set_cues(numbers, descriptions, times, starts);
	add_cue_eligible();
	open_editor(selected_node);

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
		p.innerHTML = Math.floor(i/60) + ":" + (Math.floor(i%60)).toString().padStart(2, '0');
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
	for (var i = 0; i <= t; i++) {
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
		let upperbound, lowerbound;
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
			upperbound = next_node_coords[0] - next_uptime;
			lowerbound = last_node_coords[0] + uptime;
			let collidex = Math.max(x, lowerbound);
			collidex = Math.min(collidex, upperbound);
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
		new_node = xy_to_ti(c[0], c[1] - (held_track * label_height));
		if (!evt.ctrlKey) {
			new_node[0] = Math.round(new_node[0] * 10) / 10;
			if (new_node[0] * 10000 > Math.round(xy_to_ti(upperbound)[0] * 10000)) {
				new_node[0] -= 0.1;
			}
			if (new_node[0] * 10000 < Math.round(xy_to_ti(lowerbound)[0] * 10000)) {
				new_node[0] += 0.1;
			}
			new_node[1] = Math.round(new_node[1] * 100) / 100;
		}
		starts[held_node] = new_node[0];
		tracks[held_track][held_node] = new_node[1];
		rerender_timeline();
	}
	else if (play_held) {
		let play_t = xy_to_ti(x)[0];
		if (!evt.ctrlKey) {
			play_t = Math.round(play_t * 10) / 10;
		}
		current_time = Math.max(0, Math.min(play_t, time));
		rerender_timeline();
	}
});
let autoscroll = setInterval(() => {
    if (held_node == -1) return;
	if (window.innerWidth - canvas_left_right_client_loc < 4 * vh) {
		canvasw.scrollLeft += vh;
	}
	if (canvas_left_right_client_loc - canvasw.getBoundingClientRect().left < 4 * vh) {
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


