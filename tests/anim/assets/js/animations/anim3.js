// assets/js/animations/anim3.js

import { dsLogoPrepare } from "../anim.js";

/**
 * Builds Animation 3 timeline: letters appear one-by-one (slide/fade) →
 * dot punctuation → hold → rewind back to start.
 *
 * @param {SVGElement} svg - The inlined logo SVG element.
 * @param {Object} [options]
 * @param {number} [options.delay=0] - Delay (in seconds) before the timeline starts.
 * @param {boolean} [options.paused=false] - Whether the timeline starts paused.
 * @param {number} [options.hold] - Optional hold duration (in seconds), used by animations that support a hold phase.
 * @returns {gsap.core.Timeline|undefined} The GSAP timeline, or undefined if GSAP is not available.
 */
export function animate(svg, options = {}) {
	const gsap = window.gsap;
	if (!gsap) return;

	const { letters, dot } = dsLogoPrepare(svg);

	const hold = (typeof options.hold === "number") ? options.hold : 0.8;

	// Ensure a clean state (no stroke-draw mode, no leftover inline styles)
	svg.classList.remove("is-drawing");
	letters.forEach((el) => {
		el.style.strokeDasharray = "";
		el.style.strokeDashoffset = "";
		el.style.fillOpacity = "";
		el.style.strokeOpacity = "";
		el.removeAttribute("stroke-opacity");
		el.removeAttribute("fill-opacity");
	});

	// Initial hidden state
	const init_val_letters = { opacity: 0, y: 14 }, init_val_dot = { opacity: 0, y: -10 };
	gsap.set(letters, init_val_letters);
	if (dot) gsap.set(dot, init_val_dot);

	let didRewind = false;

	const tl = gsap.timeline({
		defaults: { ease: "power2.out" },
		delay: options.delay,
		paused: options.paused
	});

	// 1) Letters appear one by one
	tl.to(letters, {
		opacity: 1,
		y: 0,
		duration: 0.38,
		stagger: 0.09
	});

	// 2) Dot punctuation at the end
	if (dot) {
		tl.to(dot, {
			opacity: 1,
			y: 0,
			duration: 0.25,
			ease: "power3.out"
		}, ">-0.02");
	}

	// 3) Hold on the final state
	tl.to({}, { duration: hold });

	// 4) Fire end callback and rewind to start (once)
	tl.add(() => {

		if (didRewind) return;
		didRewind = true;

		// Rewind to the starting point and stop there
		tl.reverse();
	});

	// Optional: clean inline transforms after rewind completes
	tl.eventCallback("onReverseComplete", () => {
		gsap.set(letters, init_val_letters);
		if (dot) gsap.set(dot, init_val_dot);
	});

	return tl;
}
