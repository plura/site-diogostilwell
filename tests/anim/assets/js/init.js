// tests/anim/assets/js/init.js

import { inlineSvgFromImg } from "./utils.js";
import { animinit } from "./anim.js";
import { animate as anim1 } from "./animations/anim1.js";
import { animate as anim2 } from "./animations/anim2.js";
import { animate as anim3 } from "./animations/anim3.js";

const animations = { 1: anim1, 2: anim2, 3: anim3 }, currentanim = 3, onReverseEnd = () => {
	console.log("Animation ended.");
}

// Boot
inlineSvgFromImg('img[src$=".svg"]')
	.then((svg) => animinit(svg, animations[currentanim], { /* paused: true, key: "Space", */ delay: 1, onReverseEnd }))
	/* .then((svg) => animinit(svg, animations[currentanim], { paused: true, key: "Space", onReverseEnd })) */
	.catch((err) => {
		console.error(err);
	});
