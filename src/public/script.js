const canvas = document.getElementById("timeline-canvas");
const ctx = canvas.getContext("2d");

console.log("test");

var zoomlevel = 1; // 10px = 1s; markers every 10s;
var zoomscale = 1;

ctx.fillRect(1990, 790, 5, 5);
ctx.fillRect(0, 0, 100, 100);

// timeline scrolling 
const scrollbar = document.getElementById("scrollbar-wrapper");
const canvasw = document.getElementById("canvas-wrapper");
scrollbar.onscroll = () => {
	canvasw.scrollLeft = scrollbar.scrollLeft;
}
canvasw.onscroll = () => {
	scrollbar.scrollLeft = canvasw.scrollLeft;
}


