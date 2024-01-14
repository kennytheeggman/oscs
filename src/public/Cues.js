export class Cue {

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
				this.time.time * this.d[0].query("space per second") 
					+ this.d[0].query("track node offset"),
				(i + 1 - intensity) * this.d[0].query("track size") 
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

export class Time {
	
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



