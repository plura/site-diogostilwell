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

	const hold = (typeof options.hold === "number") ? options.hold : 0.5;

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

	// More dramatic initial hidden state
	const init_val_letters = { opacity: 0, y: 24, scale: 0.985 };
	const init_val_dot = { opacity: 0, y: -28, scale: 0.9 };

	gsap.set(letters, init_val_letters);
	if (dot) gsap.set(dot, init_val_dot);

	let didRewind = false;

	const tl = gsap.timeline({
		delay: options.delay,
		paused: options.paused
	});

	// 1) Letters appear one by one (slower + a touch of overshoot)
	tl.to(letters, {
		opacity: 1,
		y: 0,
		scale: 1,
		duration: 0.4,
		stagger: 0.1,
		ease: "back.out(1.35)",
		immediateRender: false
	});

	// 2) Dot punctuation (elastic drop + tiny pop)
	if (dot) {
		tl.to(dot, {
			opacity: 1,
			y: 0,
			scale: 1,
			duration: 0.5,
			ease: "elastic.out(1, 0.38)",
			immediateRender: false
		}, ">-0.06");
	}

	// 3) Hold on the final state
	tl.to({}, { duration: hold });

	// 4) Rewind to start (once)
	tl.add(() => {
		if (didRewind) return;
		didRewind = true;

		tl.reverse();
	});

	// Lock back to initial state after rewind completes
	tl.eventCallback("onReverseComplete", () => {
		gsap.set(letters, init_val_letters);
		if (dot) gsap.set(dot, init_val_dot);
	});

	return tl;
}

