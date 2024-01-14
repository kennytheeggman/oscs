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
const delete_button = document.getElementById("delete");
const go_button = document.getElementById("go");
const pause_button = document.getElementById("pause");
const stop_button = document.getElementById("stop");
const preview = document.getElementById("preview-canvas");
const ptx = preview.getContext("2d");
const previeww = document.getElementById("preview");

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
const preview_outline_color = "#767b91";
const undo_depth = 50;

// 
function update_dims() {
	width = scrollbar.scrollWidth;
	height = labels.offsetHeight;
	vh = window.innerHeight * 0.01;
	
	canvas.width = width;
	canvas.height = height;

	preview.width = previeww.clientWidth;
	preview.height = previeww.clientHeight;
	
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
	"Middle Top 1", "Middle Top 2", "Middle Top 3", "Middle Top 4", "Middle Top 5", "Middle Top 6", 
	"Lower Top 1", "Lower Top 2", "Lower Top 3", "Lower Top 4", "Lower Top 5", "Lower Top 6", 
	"Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5", "Tip 6", "Tip 7", "Tip 8", "Tip 9",
	"Follow 1", "Follow 2"
];
var tracks = [
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
	[0],
];
var starts = [1];
var times = [0.5];
var numbers = [0.1];
var descriptions = [""];
var colors = [
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
	["#ffffff"],
];
var held = false;
var time = 1;
var play_held = false;
var held_node = -1;
var held_track = -1;
var selected_node = -1;
var selected_track = -1;
var current_time = time-1;
var player = setInterval(() => {});
var paused = true;
var current_intensity = [];
var current_color = [];


// ----------------------------- file operations ---------------------------- //

var modal_open = false;
document.getElementById("toggle_modal").onclick = () => {
	document.getElementById("project_modal").showModal();
}
document.getElementById("show_surface").onclick = () => {
	document.getElementById("show").click();
}
document.getElementById("music_surface").onclick = () => {
	document.getElementById("music").click();
}
document.getElementById("save").onclick = () => {
	const text = buildCSV(tracks, colors, starts, times, numbers, descriptions);
	let blob = new Blob([text], {type: "text/plain"});
	let url = window.URL.createObjectURL(blob);
	let alink = document.createElement("a");
	alink.href = url;
	alink.download = "show.csv";
	alink.click();
}
const in1 = document.getElementById("show");
in1.addEventListener("change", () => {
	let file = in1.files[0];
	let reader = new FileReader();
	let res = true;
	reader.addEventListener("load", () => {
		parseCSV(reader.result);
	})
	reader.addEventListener("error", () => {
		res = false;
	});
	if (res) reader.readAsText(file);
});

const in2 = document.getElementById("music");
in2.addEventListener("change", () => {
	let file = in2.files[0];
	let reader = new FileReader();
	let res = true;
	reader.addEventListener("load", () => {
		console.log(reader.result);
		document.getElementById("music_player").setAttribute("src", reader.result);
	});
	reader.addEventListener("error", () => {
		res = false;
	});
	reader.readAsDataURL(file);
});

document.getElementById("project_modal").addEventListener("click", (e) => {
	if (e.target === document.getElementById("project_modal")) document.getElementById("project_modal").close();
});

function rgb2hsv (r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return [Math.round(h * 360), percentRoundFn(s * 100), percentRoundFn(v * 100)];
}

function buildCSV(ntracks, ncolors, nstarts, ntimes, nnumbers, ndescriptions) {
	let actual_intensities = new Array(28).fill().map(() => new Array());
	let actual_colors = new Array(28).fill().map(() => new Array());
	let actual_follows = [];
	let actual_times = ntimes;
	let actual_numbers = nnumbers;
	let actual_descriptions = ndescriptions;

	let init_grid = [
		["START_LEVELS", "", "" , "", "" , "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		["TARGET_TYPE", "TARGET_TYPE_AS_TEXT", "TARGET_LIST_NUMBER", "TARGET_ID", "TARGET_PART_NUMBER", "CHANNEL", "PARAMETER_TYPE", "PARAMETER_TYPE_AS_TEXT", "LEVEL", "LEVEL_REFERENCE_TYPE", "LEVEL_REFERENCE_TYPE_AS_TEXT", "LEVEL_REFERENCE_LIST_NUMBER", "LEVEL_REFERENCE_ID", "FADE_TIME", "DELAY_TIME", "MARK_CUE", "TRACK_TYPE", "EFFECT", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		["END_LEVELS", "", "" , "", "" , "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		["START_TARGETS", "", "" , "", "" , "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		["TARGET_TYPE", "TARGET_TYPE_AS_TEXT", "TARGET_LIST_NUMBER", "TARGET_ID", "TARGET_DCID", "PART_NUMBER", "LABEL", "TIME_DATA", "UP_DELAY", "DOWN_TIME", "DOWN_DELAY", "FOCUS_TIME", "FOCUS_DELAY", "COLOR_TIME", "COLOR_DELAY", "BEAM_TIME", "BEAM_DELAY", "DURATION", "MARK", "BLOCK", "ASSERT", "ALL_FADE", "PREHEAT", "FOLLOW", "LINK", "LOOP", "CURVE", "RATE", "EXTERNAL_LINKS", "EFFECTS", "MODE", "CUE_NOTES", "SCENE_TEXT", "SCENE_END"],
		["END_TARGETS", "", "" , "", "" , "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
	];

	let find_next_levels = () => {
		for (let i = 0; i < init_grid.length; i++) {
			if (init_grid[i][0] == "END_LEVELS") return i;
		}
		return -1;
	}
	let find_next_targets = () => {
		for (let i = 0; i < init_grid.length; i++) {
			if (init_grid[i][0] == "END_TARGETS") return i;
		}
		return -1;
	}
	console.log(find_next_levels());

	const patch = [
		13, 14, 15, 16, 17, 
		31, 32, 33, 34, 35, 36, 
		37, 38, 39, 40, 41, 42, 
		1, 2, 3, 5, 6, 7, 9, 10, 11, 
		4, 8
	];

	ntracks.forEach((track, i) => {
		track.forEach((intens, j) => {
			const color = ncolors[i][j];
			const rgb = [parseInt(color.substring(1, 3), 16), parseInt(color.substring(3, 5), 16), parseInt(color.substring(5), 16)];
			const hsl = rgb2hsv(...rgb);
			actual_intensities[i].push(hsl[2] * intens);
			actual_colors[i].push([hsl[0], hsl[1]]);
		});
	});
	nstarts.forEach((start, i) => {
		const previous = i == 0 ? 0 : nstarts[i-1];
		actual_follows.push(start-previous);
	});
	actual_numbers.forEach((number, i) => {
		const description = actual_descriptions[i];
		const time = actual_times[i].toString();
		const follow = actual_follows[i].toString();
		const target_row = ["1", "Cue", "1", number.toString(), "", "", description, time, "", "", "", "", "", "", "", "", "", time, "", "", "", "", "", follow, "", "", "", "", "", "", "", "", "", ""];
		init_grid.splice(find_next_targets(), 0, target_row);

		actual_intensities.forEach((intens, j) => {
			const intensity = Math.round(intens[i]);
			const color = actual_colors[j][i];

			const level_rows = [
				["1", "Cue", "1", number.toString(), "", patch[j].toString(), "1", "Intens", intensity.toString(), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
				["1", "Cue", "1", number.toString(), "", patch[j].toString(), "7", "Hue", Math.round(color[0]).toString(), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
				["1", "Cue", "1", number.toString(), "", patch[j].toString(), "8", "Saturation", Math.round(color[1]).toString(), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
				["1", "Cue", "1", number.toString(), "", patch[j].toString(), "17", "Cooling_Fan", "-3", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
				["1", "Cue", "1", number.toString(), "", patch[j].toString(), "21", "Strobe_Mode", "17", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
				["1", "Cue", "1", number.toString(), "", patch[j].toString(), "79", "Zoom", "13", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
				["1", "Cue", "1", number.toString(), "", patch[j].toString(), "204", "Shutter_Strobe", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			];

			init_grid.splice(find_next_levels(), 0, ...level_rows);
		});
	});
	
	init_grid.forEach((row, i) => {
		row = row.join();
	});
	let csv = init_grid.join("\r\n");
	console.log(init_grid);
	return csv;
	
}

function parseCSV(text) {
	let grid = text.split("\r\n");
	let level_start, level_end;
	let target_start, target_end;
	let ntracks = new Array(28).fill().map(() => new Array());
	let ncolors = new Array(28).fill().map(() => new Array());
	let nstarts = [], ntimes = [], nnumbers = [], ndescriptions = [];
	let usehsl = [];

	const patch = {
		13: 0, 14: 1, 15: 2, 16: 3, 17: 4,
		31: 5, 32: 6, 33: 7, 34: 8, 35: 9, 36: 10,
		37: 11, 38: 12, 39: 13, 40: 14, 41: 15, 42: 16,
		1: 17, 2: 18, 3: 19, 5: 20, 6: 21, 7: 22, 9: 23, 10: 24, 11: 25,
		4: 26, 8: 27
	};
	const find_cue = (number) => {
		console.log(nnumbers);
		nnumbers.forEach((n, i) => {
			if (number == n) return i; 
		});
		return -1;
	}

	grid.forEach((_, i) => {
		grid[i] = grid[i].split(",");
	});
	grid.forEach((d, i) => {
		if (d[0] == "START_LEVELS") level_start = i + 2;
		if (d[0] == "END_LEVELS") level_end = i;
		if (d[0] == "START_TARGETS") target_start = i + 2;
		if (d[0] == "END_TARGETS") target_end = i;
	});
	console.log(grid);
	for (let i = level_start; i < level_end; i++) {
		const d = grid[i];
		if (d[0] == "1" && d[1] == "Cue" && d[2] == "1") {
			const target_id = d[3];
			const channel = d[5];
			const parameter_type = d[6];
			const parameter_label = d[7];
			const level = d[8];

			if (!(nnumbers.includes(parseFloat(target_id)))) {
				nnumbers.push(parseFloat(target_id));
				nstarts.push(0);
				ntimes.push(0);
				usehsl.push([]);
				ndescriptions.push("");
				ntracks.forEach((track) => {track.push(0)});
				ncolors.forEach((color) => {color.push("#ffffff")});
			}

			const patched_channel = patch[parseInt(channel)];
			const index = nnumbers.findIndex((e) => e == target_id);
			if (index == -1) continue;
			if (parameter_type == "1") {
				ntracks[patched_channel][index] = parseInt(level);
			}
			
			if (parameter_type == "7") {
				usehsl[index].push(Math.round(parseInt(level)));
			}
			if (parameter_type == "8") {
				usehsl[index].push(Math.round(parseInt(level)));
				let rgb = HSLToRGB(usehsl[index][0], usehsl[index][1], Math.round(ntracks[patched_channel][index]/2));
				let r = Math.round(rgb[0]).toString(16).padStart(2, '0');
				let g = Math.round(rgb[1]).toString(16).padStart(2, '0');
				let b = Math.round(rgb[2]).toString(16).padStart(2, '0');
				let hex = "#" + r + g + b;
				ncolors[patched_channel][index] = hex;
			}
			

			const hex_value = Math.round(parseInt(level) * 255 / 100).toString(16).padStart(2, '0');
			if (parameter_type == "12" && !(usehsl[index].length > 0)) {
				let color = ncolors[patched_channel][index].split("");
				color.splice(1, 2, hex_value);
				ncolors[patched_channel][index] = color.join("");
			}
			if (parameter_type == "13" && !(usehsl[index].length > 0)) {
				let color = ncolors[patched_channel][index].split("");
				color.splice(3, 2, hex_value);
				ncolors[patched_channel][index] = color.join("");
			}
			if (parameter_type == "14" && !(usehsl[index].length > 0)) {
				let color = ncolors[patched_channel][index].split("");
				color.splice(5, 2, hex_value);
				ncolors[patched_channel][index] = color.join("");
			}

		}
	}
	let cumulative_timestamp = 0;
	for (let i = target_start; i < target_end; i++) {
		const d = grid[i];
		if (d[0] == "1" && d[1] == "Cue" && d[2] == "1") {
			const target_id = d[3];
			const label = d[6];
			const time_data = d[7];
			const follow = d[23];
			cumulative_timestamp += follow == "" ? 0 : parseFloat(follow);
			
			const index = nnumbers.findIndex((e) => e == target_id);
			
			nstarts[index] = cumulative_timestamp;
			ndescriptions[index] = label;
			ntimes[index] = parseFloat(time_data);
		}
	}

	ntracks.forEach((track) => {
		track.forEach((value, i) => {
			track[i] = Math.round(value) * 0.01;
		});
	})

	tracks = ntracks;
	starts = nstarts;
	times = ntimes;
	numbers = nnumbers;
	descriptions = ndescriptions;
	colors = ncolors;
	console.log(ntracks, nstarts, ntimes, nnumbers, ndescriptions, ncolors);
	rerender_timeline();
}




// ----------------------------- preview operations ----------------------------- //

function draw_top(x, y, color, intensity) {
	ptx.beginPath();
	ptx.lineWidth = track_node_line_width;
	ctx.strokeStyle = preview_outline_color;
	ptx.moveTo(x -2*vh, y +2*vh);
	ptx.lineTo(x -2*vh, y -1*vh);
	ptx.lineTo(x -1*vh, y -2*vh);
	ptx.lineTo(x -1*vh, y -2.5*vh);
	ptx.lineTo(x +1*vh, y -2.5*vh);
	ptx.lineTo(x +1*vh, y -2*vh);
	ptx.lineTo(x +2*vh, y -1*vh);
	ptx.lineTo(x +2*vh, y +2*vh);
	ptx.lineTo(x -2*vh, y +2*vh);
	ptx.fillStyle = "black";
	ptx.fill();
	ptx.fillStyle = "#" + color.substring(1) + Math.round(intensity * 255).toString(16);
	ptx.fill();
	ptx.stroke();
}
function draw_tip(x, y, color, intensity) {
	ptx.beginPath();
	ptx.lineWidth = track_node_line_width;
	ctx.strokeStyle = preview_outline_color;
	ptx.arc(x, y +4*vh, 2*vh, 0, Math.PI);
	ptx.moveTo(x -2*vh, y +4*vh);
	ptx.lineTo(x -2*vh, y +2*vh);
	ptx.lineTo(x -1.5*vh, y +1*vh);
	ptx.lineTo(x -1.5*vh, y -1*vh);
	ptx.lineTo(x -2*vh, y -2*vh);
	ptx.lineTo(x -2*vh, y -3*vh);
	ptx.lineTo(x +2*vh, y -3*vh);
	ptx.lineTo(x +2*vh, y -2*vh);
	ptx.lineTo(x +1.5*vh, y -1*vh);
	ptx.lineTo(x +1.5*vh, y +1*vh);
	ptx.lineTo(x +2*vh, y +2*vh);
	ptx.lineTo(x +2*vh, y +4*vh);
	ptx.fillStyle = "black";
	ptx.fill();
	ptx.fillStyle = color + Math.round(intensity * 255).toString(16);
	ptx.fill();
	ptx.stroke();
}
function calculate_current_params() {
	let next_node = -1;
	for (let i = starts.length - 1; i >= 0; i--) {
		if (current_time <= starts[i]) {
			next_node = i;
		}
		else {
			break;
		}
	}
	let interval_start_time = 0;
	if (next_node > 0) {
		interval_start_time = starts[next_node-1];
	}
	if (next_node == -1) {
		let intenss = [], colorss = [];
		for (let i = 0; i < 25; i++) {
			intenss.push(0);
			colorss.push("#ffffff");
		}
		current_intensity = intenss;
		current_color = colorss
		return;
	}
	let fade_end_time = interval_start_time + times[next_node];
	let proportion = 1;
	if (current_time >= interval_start_time && current_time < fade_end_time) {
		proportion = (current_time - interval_start_time) / times[next_node];
	}
	let intenss = [], colorss = []
	for (let i = 0; i < tracks.length; i++) {
		let last_intensity = 0;
		let last_color = "#ffffff";
		if (next_node != 0) {
			last_intensity = tracks[i][next_node - 1];
			last_color = colors[i][next_node - 1];
		}
		intenss.push(last_intensity + (tracks[i][next_node] - last_intensity) * proportion);
		let c2 = colors[i][next_node];
		let c1 = last_color;
		let r2 = parseInt(c2.substring(1, 3), 16), g2 = parseInt(c2.substring(3, 5), 16), b2 = parseInt(c2.substring(5), 16);
		[r2, g2, b2] = RGBToHSL(r2, g2, b2);
		let r1 = parseInt(c1.substring(1, 3), 16), g1 = parseInt(c1.substring(3, 5), 16), b1 = parseInt(c1.substring(5), 16);
		[r1, g1, b1] = RGBToHSL(r1, g1, b1);
		let r = Math.round(r1 + (r2-r1)*proportion), g = Math.round(g1 + (g2-g1)*proportion), b = Math.round(b1 + (b2-b1)*proportion);
		[r, g, b] = HSLToRGB(r, g, b);
		colorss.push("#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0"));
	}
	current_intensity = intenss;
	current_color = colorss;
}
function RGBToHSL(r,g,b) {
	r /= 255;
	g /= 255;
	b /= 255;
	let cmin = Math.min(r,g,b),
		cmax = Math.max(r,g,b),
		delta = cmax - cmin,
		h = 0,
		s = 0,
		l = 0;
	if (delta == 0)
	h = 0;
	else if (cmax == r)
		h = ((g - b) / delta) % 6;
	else if (cmax == g)
		h = (b - r) / delta + 2;
	else
		h = (r - g) / delta + 4;
	h = Math.round(h * 60);
	if (h < 0)
		h += 360;
	l = (cmax + cmin) / 2;
	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);
	return [h, s, l];
}
function HSLToRGB(h,s,l) {
	s /= 100;
	l /= 100;
	let c = (1 - Math.abs(2 * l - 1)) * s,
		x = c * (1 - Math.abs((h / 60) % 2 - 1)),
		m = l - c/2,
		r = 0,
		g = 0,
		b = 0;
	if (0 <= h && h < 60) {
		r = c; g = x; b = 0;  
	} else if (60 <= h && h < 120) {
		r = x; g = c; b = 0;
	} else if (120 <= h && h < 180) {
		r = 0; g = c; b = x;
	} else if (180 <= h && h < 240) {
		r = 0; g = x; b = c;
	} else if (240 <= h && h < 300) {
		r = x; g = 0; b = c;
	} else if (300 <= h && h < 360) {
		r = c; g = 0; b = x;
	}
	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);
	return [r, g, b];
}
function render_scene() {
	preview.width = preview.width;
	calculate_current_params();
	track_counter = 0;
	for (let i = -20*vh, c = 0; c < 5;  i += 10*vh, c++) {
		draw_top(i + preview.width / 2, 10 * vh, current_color[track_counter], current_intensity[track_counter]);
		track_counter++;
	}
	for (let i = -25*vh, c = 0; c < 6;  i += 10*vh, c++) {
		draw_top(i + preview.width / 2, 18 *vh, current_color[track_counter], current_intensity[track_counter]);
		track_counter++;
	}
	for (let i = -25*vh, c = 0; c < 6; i+= 10*vh, c++) {
		draw_top(i + preview.width / 2, 26*vh, current_color[track_counter], current_intensity[track_counter]);
		track_counter++;
	}
	for (let i = -32*vh, c = 0; c < 9;  i += 8*vh, c++) {
		draw_tip(i + preview.width / 2, 38 *vh, current_color[track_counter], current_intensity[track_counter]);
		track_counter++;
	}
	for (let i = -5*vh, c = 0; c < 2;  i += 10*vh, c++) {
		draw_tip(i + preview.width / 2, 50 * vh, current_color[track_counter], current_intensity[track_counter]);
		track_counter++;
	}
}


// ----------------------------- undo operation ----------------------------- //

var past_states = [];
var future_states = [];
let save_state = (from_trigger) => {
	let state_obj = {
		"tracks": tracks,
		"starts": starts,
		"times": times,
		"numbers": numbers,
		"descriptions": descriptions,
		"colors": colors
	};
	let includes = false;
	if (past_states[past_states.length - 1] == JSON.stringify(state_obj)) includes = true;
	if (!includes) {
		past_states.push(JSON.stringify(state_obj));
		if (past_states.length > undo_depth) {
			past_states.shift();
		}
		if (from_trigger != true && future_states.length > 0) {
			future_states = [];
		}
	}

}

document.addEventListener("mouseup", save_state);
document.onkeyup = save_state;
document.addEventListener("keydown", (evt) => {
	if (evt.key == "z" && evt.ctrlKey && past_states.length > 1) {
		evt.preventDefault();
		let old_state = past_states.pop();
		let new_state = past_states.pop();
		let state_obj = JSON.parse(new_state);
		tracks = state_obj["tracks"];
		starts = state_obj["starts"];
		times = state_obj["times"];
		numbers = state_obj["numbers"];
		descriptions = state_obj["descriptions"];
		colors = state_obj["colors"];
		future_states.push(old_state);
		save_state(true);
		rerender_timeline();
	}
	if (evt.key == "y" && evt.ctrlKey && future_states.length > 0) {
		evt.preventDefault();
		let new_state = future_states.pop();
		let state_obj = JSON.parse(new_state);
		tracks = state_obj["tracks"];
		starts = state_obj["starts"];
		times = state_obj["times"];
		numbers = state_obj["numbers"];
		descriptions = state_obj["descriptions"];
		colors = state_obj["colors"];
		past_states.push(new_state);
		save_state(true);
		rerender_timeline();
	}
	else {
		// save_state();
	}
});


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
		div.onclick = () => {
			selected_node = i;
			rerender_timeline();
		}
		div.innerHTML += "<p>" + number + "</p>";
		div.innerHTML += "<p>" + description + "</p>";
		div.innerHTML += "<p>" + format_time(fade) + "</p>";
		div.innerHTML += "<p>" + format_time(duration) + "</p>";

		cues.appendChild(div);
	}
}
var after_dec = false;
var after_dec_2 = false;
var clicked_once = false;
var cue_to_delete = -1;

go_button.onclick = () => {
	if (!paused) {
		return;
	}
	paused = false;
	let dt = 0.02
	if (document.getElementById("music_player").src != "") {
		document.getElementById("music_player").currentTime = current_time;
		document.getElementById("music_player").play();
	}
	player = setInterval(() => {
		if (document.getElementById("music_player").src != "") { current_time = document.getElementById("music_player").currentTime; }
		else { current_time += dt; }
		if (current_time > time) {
			paused = true;
			document.getElementById("music_player").pause();
			current_time = 0;
			rerender_timeline();
			clearInterval(player);
		}
		rerender_timeline();
	}, 1000 * dt);
}
pause_button.onclick = () => {
	paused = true;
	document.getElementById("music_player").pause();
	clearInterval(player);
	rerender_timeline();
}
stop_button.onclick = () => {
	paused = true;
	document.getElementById("music_player").pause();
	clearInterval(player);
	current_time = 0;
	rerender_timeline();
}
add_button.onclick = () => {
	let next_cue = starts.length;
	for (let i = starts.length - 1; i >= 0; i--) {
		if (current_time < starts[i]) {
			next_cue = i;
		}
		else {
			break
		}
	}
	console.log(next_cue);
	starts.splice(next_cue, 0, current_time);
	times.splice(next_cue, 0, 0);
	new_numbers = []
	for (let i = 1; i <= times.length; i++) {
		new_numbers.push(i / 10);
	}
	numbers = new_numbers;
	descriptions.splice(next_cue, 0, "");
	for (let i = 0; i < tracks.length; i++) {
		tracks[i].splice(next_cue, 0, 0);
		colors[i].splice(next_cue, 0, "#ffffff");
	}
	console.log(next_cue);
	selected_node = next_cue;
	rerender_timeline();
}
delete_button.onclick = () => {
	if (!clicked_once) {
		delete_button.value = "Delete?";
		clicked_once = true;
		cue_to_delete = selected_node;
	}
	else {
		starts.splice(selected_node, 1);
		times.splice(selected_node, 1);
		numbers.splice(selected_node, 1);
		descriptions.splice(selected_node, 1);
		for (let i = 0; i < tracks.length; i++) {
			tracks[i].splice(selected_node, 1);
			colors[i].splice(selected_node, 1);
		}
		selected_node = -1;
		rerender_timeline();
		delete_button.value = "Delete";
	}
}

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
// 	starts[selected_node] = (check_end_eligibility(0)) ? 0 : starts[selected_node];
	rerender_timeline();
	end_time_input.setSelectionRange(4, 4);
}
var temp_start, last_eligible_end;
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
	end_time_input.setSelectionRange(4, 4);
}
function check_end_eligibility(t) {
	let eligible = true;
	for (let i = 1; i < starts.length; i++) {
		if (i == selected_node + 1) {
			continue;
		}
		if (t < times[selected_node] + starts[i-1] && t >= starts[i-1]) {
			eligible = false;
		}
		else if (t >= starts[i] - times[i] && t < starts[i]) {
			eligible = false;
		}
	}
	if (t < times[selected_node] || (t > starts[0] - times[0] && t <= starts[0])) {
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
function open_editor(cue, update_end_time) {
	if (cue == -1) {
		editor.style.transform = "translate(100%, 0)";
		delete_button.setAttribute("disabled", "");
		return;
	}
	delete_button.removeAttribute("disabled");
	let newly_opened = editor.style.transform == "translate(100%, 0px)" || update_end_time;
	editor.style.transform = "";
	let color_inputs = document.querySelectorAll('div.lighting>input[type="color"]');
	let intensity_inputs = document.querySelectorAll('div.lighting>input[type="number"]');
	
	let map_to_element_index = (i) => {
		if (i <= 4) {
			return i + 1;
		}
		else if (i <= 10) {
			return i + 2;
		}
		else if (i <= 16) {
			return i + 3;
		}
		else if (i <= 25) {
			return i + 4;
		}
		else if (i <= 27) {
			return i + 5;
		}
	}

	let header_text = document.getElementById("header-text");
	let cue_number_input = document.getElementById("cuenum");
	let description_input = document.getElementById("desc");
	let fade_time_input = document.getElementById("timeup");
	let end_time_input = document.getElementById("follow");
	
	description_input.onchange = () => {
		descriptions[cue] = description_input.value;
		header_text.innerHTML = "Cue " + numbers[cue] + " - " + descriptions[cue];
	}
	cue_number_input.onchange = () => {
		numbers[cue] = parseFloat(cue_number_input.value);
	header_text.innerHTML = "Cue " + numbers[cue] + " - " + descriptions[cue];
	}

	cue_number_input.value = numbers[cue];
	description_input.value = descriptions[cue];
	header_text.innerHTML = "Cue " + numbers[cue] + " - " + descriptions[cue];
	
	let all_tracks_same = [true, true, true, true, true];
	let tracks_last_int = [tracks[0][cue], tracks[5][cue], tracks[11][cue], tracks[17][cue], tracks[26][cue]]
	let all_colors_same = [true, true, true, true, true];
	let tracks_last_col = [colors[0][cue], colors[5][cue], colors[11][cue], colors[17][cue], colors[26][cue]]
	for (let i = 0; i < tracks.length; i++) {
		color_inputs[map_to_element_index(i)].value = colors[i][cue];
		color_inputs[map_to_element_index(i)].onchange = () => {
			colors[i][cue] = color_inputs[map_to_element_index(i)].value;
			rerender_timeline();
		}

		intensity_inputs[map_to_element_index(i)].value = tracks[i][cue] * 100;
		intensity_inputs[map_to_element_index(i)].onchange = () => {
			tracks[i][cue] = parseInt(intensity_inputs[map_to_element_index(i)].value) / 100;
			rerender_timeline();
		}
	}
	for (let i = 0; i < 5; i++) {
		if (tracks[i][cue] != tracks_last_int[0]) all_tracks_same[0] = false;
		if (colors[i][cue] != tracks_last_col[0]) all_colors_same[0] = false;
	}
	for (let i = 5; i < 11; i++) {
		if (tracks[i][cue] != tracks_last_int[1]) all_tracks_same[1] = false;
		if (colors[i][cue] != tracks_last_col[1]) all_colors_same[1] = false;
	}
	for (let i = 11; i < 17; i++) {
		if (tracks[i][cue] != tracks_last_int[2]) all_tracks_same[2] = false;
		if (colors[i][cue] != tracks_last_col[2]) all_colors_same[2] = false;
	}
	for (let i = 17; i < 26; i++) {
		if (tracks[i][cue] != tracks_last_int[3]) all_tracks_same[3] = false;
		if (colors[i][cue] != tracks_last_col[3]) all_colors_same[3] = false;
	}
	if (tracks[27][cue] != tracks_last_int[4]) all_tracks_same[4] = false;
	if (colors[27][cue] != tracks_last_col[4]) all_colors_same[4] = false;
	if (all_tracks_same[0]) intensity_inputs[0].value = tracks[0][cue] * 100;
	else intensity_inputs[0].value = '';
	if (all_colors_same[0]) color_inputs[0].value = colors[0][cue];
	else color_inputs[0].value = "#ffffff";
	intensity_inputs[0].onchange = () => {
		for (let i = 0; i < 5; i++) { tracks[i][cue] = parseInt(intensity_inputs[0].value) / 100; }
		rerender_timeline();
	}
	color_inputs[0].onchange = () => {
		for (let i = 0; i < 5; i++) { colors[i][cue] = color_inputs[0].value; }
		rerender_timeline();
	}
	if (all_tracks_same[1]) intensity_inputs[6].value = tracks[5][cue] * 100;
	else intensity_inputs[6].value = '';
	if (all_colors_same[1]) color_inputs[6].value = colors[5][cue];
	else color_inputs[6].value = "#ffffff";
	intensity_inputs[6].onchange = () => {
		for (let i = 5; i < 11; i++) { tracks[i][cue] = parseInt(intensity_inputs[6].value) / 100; }
		rerender_timeline();
	}
	color_inputs[6].onchange = () => {
		for (let i = 5; i < 11; i++) { colors[i][cue] = color_inputs[6].value; }
		rerender_timeline();
	}
	if (all_tracks_same[2]) intensity_inputs[13].value = tracks[11][cue] * 100;
	else intensity_inputs[13].value = '';
	if (all_colors_same[2]) color_inputs[13].value = colors[11][cue];
	else color_inputs[13].value = "#ffffff";
	intensity_inputs[13].onchange = () => {
		for (let i = 11; i < 17; i++) { tracks[i][cue] = parseInt(intensity_inputs[13].value) / 100; }
		rerender_timeline();
	}
	color_inputs[13].onchange = () => {
		for (let i = 11; i < 17; i++) { colors[i][cue] = color_inputs[13].value; }
		rerender_timeline();
	}
	if (all_tracks_same[3]) intensity_inputs[20].value = tracks[17][cue] * 100;
	else intensity_inputs[20].value = '';
	if (all_colors_same[3]) color_inputs[20].value = colors[17][cue];
	else color_inputs[20].value = "#ffffff";
	intensity_inputs[20].onchange = () => {
		for (let i = 17; i < 26; i++) { tracks[i][cue] = parseInt(intensity_inputs[20].value) / 100; }
		rerender_timeline();
	}
	color_inputs[20].onchange = () => {
		for (let i = 17; i < 26; i++) { colors[i][cue] = color_inputs[20].value; }
		rerender_timeline();
	}
	if (all_tracks_same[4]) intensity_inputs[30].value = tracks[26][cue] * 100;
	else intensity_inputs[30].value = '';
	if (all_colors_same[4]) color_inputs[30].value = colors[26][cue];
	else color_inputs[30].value = "#ffffff";
	intensity_inputs[30].onchange = () => {
		for (let i = 26; i < 28; i++) { tracks[i][cue] = parseInt(intensity_inputs[30].value) / 100; }
		rerender_timeline();
	}
	color_inputs[30].onchange = () => {
		for (let i = 26; i < 28; i++) { colors[i][cue] = color_inputs[30].value; }
		rerender_timeline();
	}




	if (newly_opened) {
		temp_start = starts[cue];
	}
	
	let fmin = Math.floor((times[cue]) / 60).toString().padStart(1, "0");
	let fsec = (Math.floor(times[cue]) % 60).toString().padStart(2, "0");
	let fdec = Math.round(((times[cue]) - Math.floor(times[cue])) * 100).toString().padStart(2, "0");

	let emin = Math.floor((temp_start) / 60).toString().padStart(1, "0");
	let esec = (Math.floor(temp_start) % 60).toString().padStart(2, "0");
	let edec = Math.round(((temp_start) - Math.floor(temp_start)) * 100).toString().padStart(2, "0");

	fade_time_input.value = fmin + ":" + fsec + "." + fdec;
	end_time_input.value = emin + ":" + esec + "." + edec;
	
}
function autosort_cues() {
	let swap_with_previous = (arr, index) => {
		let temp = arr[index]
		arr[index] = arr[index-1]
		arr[index-1] = temp;
		return arr;
	}
	let selected_cue = numbers[selected_node];
	for (let j = 0; j < starts.length; j++) {
		for (let i = 1; i < starts.length; i++) {
			if (starts[i] < starts[i-1]) {
				starts = swap_with_previous(starts, i);
				times = swap_with_previous(times, i);
				descriptions = swap_with_previous(descriptions, i);
				for (let k = 0; k < tracks.length; k++) {
					tracks[k] = swap_with_previous(tracks[k], i);
					colors[k] = swap_with_previous(colors[k], i);
				}
			}
		}
	}
	for (let i = 0; i < numbers.length; i++) {
		if (numbers[i] == selected_cue) {
			selected_node = i;
		}
	}
}


// ----------------------------- timeline operation -----------------------------  //

function reset_timeline() {
	set_lights(lights);
}
function rerender_timeline(update_end_time) {
	let save_scrollx = canvasw.scrollLeft;
	let save_scrolly = keys.scrollTop;
	autosort_cues();
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
	open_editor(selected_node, update_end_time);
	if (selected_node != cue_to_delete) {
		delete_button.value = "Delete";
		clicked_once = false;
		cue_to_delete = -1;
	}
	calculate_current_params();
	render_scene();

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
	let update_end_time = false;
	let distance_from_play = Math.abs(evt.offsetX - current_time * space_per_second);
	if (held_node == -1 && distance_from_play < 2 * vh) {
	    play_held = true;
	}
	else {
	    update_end_time = true;
	    selected_node = held_node;
	    selected_track = held_track;
	}
	rerender_timeline(update_end_time);
});
document.addEventListener("mouseup", () => {
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
				return [collidex, node_coords[1] + held_track * label_height];
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
		temp_start = new_node[0]
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


