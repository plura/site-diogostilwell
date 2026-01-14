// tests/anim/assets/js/animations/anim1.js

import { dsLogoPrepare } from "../anim.js";

/**
 * Builds Animation 1 timeline: outline draw-on → fill-in (overlapping end) →
 * dot punctuation → cleanup.
 *
 * Relies on CSS-state rules:
 * - `#ds-logo.is-drawing …` provides stroke styling
 * - Fill is animated via GSAP (`fillOpacity`) while in drawing state
 *
 * @param {SVGElement} svg - The inlined logo SVG element.
 * @param {Object} [options]
 * @param {number} [options.delay=0] - Delay (in seconds) before the timeline starts.
 * @param {boolean} [options.paused=false] - Whether the timeline starts paused.
 * @param {number} [options.hold] - Optional hold duration (in seconds), used by animations that support a hold phase.
 * @returns {gsap.core.Timeline|undefined} The GSAP timeline, or undefined if GSAP is not available.
 */
export function animate(svg, options = { delay: 0, paused: false }) {
	const gsap = window.gsap;
	if (!gsap) return;

	const { letters, dot } = dsLogoPrepare(svg);

	// Switch SVG to drawing mode (stroke visible; fill opacity is animated)
	svg.classList.add("is-drawing");

	// Prep dash drawing (per-path length)
	function prepDash(el) {
		if (typeof el.getTotalLength !== "function") return;
		const len = el.getTotalLength();
		el.style.strokeDasharray = `${len}`;
		el.style.strokeDashoffset = `${len}`;
	}
	letters.forEach(prepDash);

	// Dot hidden until the end
	if (dot) gsap.set(dot, { opacity: 0, y: -10 });

	const tl = gsap.timeline({
		defaults: { ease: "power2.out" },
		delay: options.delay,
		paused: options.paused
	});

	// 1) Stroke draw
	tl.to(letters, {
		strokeDashoffset: 0,
		duration: 1.1,
		stagger: 0.06
	});

	// 2) Fill-in + stroke-out (overlap with end of draw)
	tl.fromTo(
		letters,
		{ fillOpacity: 0 },
		{ fillOpacity: 1, duration: 0.55, stagger: 0.04 },
		"-=0.22"
	);

	tl.fromTo(
		letters,
		{ strokeOpacity: 1 },
		{ strokeOpacity: 0, duration: 0.55, stagger: 0.04 },
		"<"
	);

	// 3) Dot punctuation AFTER fill
	if (dot) {
		tl.to(dot, {
			opacity: 1,
			y: 0,
			duration: 0.35,
			ease: "power3.out"
		});
	}

	// 4) Cleanup
	tl.add(() => {
		svg.classList.remove("is-drawing");

		letters.forEach((el) => {
			el.style.strokeDasharray = "";
			el.style.strokeDashoffset = "";
			el.style.fillOpacity = "";
			el.style.strokeOpacity = "";
			el.removeAttribute("stroke-opacity");
			el.removeAttribute("fill-opacity");
		});
	});

	return tl;
}
