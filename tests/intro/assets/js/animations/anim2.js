// // tests/anim/assets/js/animations/anim2.js

import { dsLogoPrepare } from "../anim.js";

/**
 * Builds Animation 2 timeline: editorial horizontal wipe (clip reveal) →
 * dot punctuation → cleanup.
 *
 * Notes:
 * - Uses an SVG clipPath + rect reveal (left → right).
 * - Keeps the logo filled (no stroke-draw mode).
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

	// Ensure everything is visible (no leftover state)
	svg.classList.remove("is-drawing");
	letters.forEach((el) => {
		el.style.strokeDasharray = "";
		el.style.strokeDashoffset = "";
		el.style.fillOpacity = "";
		el.style.strokeOpacity = "";
		el.removeAttribute("stroke-opacity");
		el.removeAttribute("fill-opacity");
	});

	// Dot hidden until the end (punctuation)
	if (dot) gsap.set(dot, { opacity: 0, y: -10 });

	// Compute bounds for the reveal rectangle
	const bounds = svg.getBBox();
	const pad = Math.max(2, bounds.width * 0.01);

	const x = bounds.x - pad;
	const y = bounds.y - pad;
	const w = bounds.width + pad * 2;
	const h = bounds.height + pad * 2;

	// Ensure <defs> exists
	let defs = svg.querySelector("defs");
	if (!defs) {
		defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
		svg.insertBefore(defs, svg.firstChild);
	}

	// Unique IDs so you can rerun without collisions
	const uid = `ds-clip-${Date.now()}-${Math.random().toString(16).slice(2)}`;

	// Create clipPath + rect
	const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
	clipPath.setAttribute("id", uid);

	const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	clipRect.setAttribute("x", `${x}`);
	clipRect.setAttribute("y", `${y}`);
	clipRect.setAttribute("width", "0");
	clipRect.setAttribute("height", `${h}`);

	clipPath.appendChild(clipRect);
	defs.appendChild(clipPath);

	// Wrap current SVG children (except defs) into a group we can clip
	const clipGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
	clipGroup.setAttribute("clip-path", `url(#${uid})`);

	const toWrap = Array.from(svg.childNodes).filter((n) => {
		if (n.nodeType !== 1) return false;
		return n.nodeName.toLowerCase() !== "defs";
	});

	toWrap.forEach((n) => clipGroup.appendChild(n));
	svg.appendChild(clipGroup);

	const tl = gsap.timeline({
		defaults: { ease: "power2.out" },
		delay: options.delay,
		paused: options.paused
	});

	// 1) Wipe reveal (left → right)
	tl.to(clipRect, {
		attr: { width: w },
		duration: 0.9,
		ease: "power2.out"
	});

	// 2) Small pause (editorial confidence)
	tl.to({}, { duration: 0.12 });

	// 3) Dot punctuation AFTER reveal
	if (dot) {
		tl.to(dot, {
			opacity: 1,
			y: 0,
			duration: 0.28,
			ease: "power3.out"
		});
	}

	// 4) Cleanup: remove clip group, restore original structure, remove defs clipPath
	tl.add(() => {
		// Move wrapped nodes back out
		const children = Array.from(clipGroup.childNodes);
		children.forEach((n) => svg.appendChild(n));

		clipGroup.remove();
		clipPath.remove();

		// Clean dot inline transforms
		if (dot) {
			dot.style.opacity = "";
			dot.style.transform = "";
		}
	});

	return tl;
}
