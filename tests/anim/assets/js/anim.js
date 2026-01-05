// assets/js/anim.js

/**
 * Initializes a logo animation timeline and optionally binds a keyboard toggle.
 *
 * @param {SVGElement} svg - The inlined logo SVG element.
 * @param {(svg: SVGElement, options?: { paused?: boolean }) => any} animation - Animation factory that returns a GSAP timeline.
 * @param {{ delay?: number, paused?: boolean, key?: string|false, onEnd?: Function|false }} [options]
 * @param {boolean} [options.paused=false] - Whether the timeline starts paused.
 * @param {string|false} [options.key=false] - KeyboardEvent.code to toggle play/pause (e.g. "Space"). Set false to disable.
* @param {Function|false} [options.onEnd=false] - Callback fired when the timeline reaches the end (forward play).
 * @returns {void}
 */
export function animinit(svg, animation, options = { delay: 0, paused: false, key: false, onEnd: false, onReverseEnd: false }) {
	if (!animation) return;

	const tl = animation(svg, { delay: options.delay, paused: options.paused });
	if (!tl) return;

	if (typeof options.onEnd === "function") {
		const prev = tl.eventCallback("onComplete");
		tl.eventCallback("onComplete", () => {
			if (typeof prev === "function") prev();
			options.onEnd(tl);
		});
	}

	if (typeof options.onReverseEnd === "function") {
		const prev = tl.eventCallback("onReverseComplete");
		tl.eventCallback("onReverseComplete", () => {
			if (typeof prev === "function") prev();
			options.onReverseEnd(tl);
		});
	}

	if (!options.key) return;
	if (typeof options.key !== "string") return;

	// Guard to avoid stacking listeners
	if (svg.dataset.dsanimKeyListener === "1") return;
	svg.dataset.dsanimKeyListener = "1";

	document.addEventListener("keydown", (e) => {
		if (e.code !== options.key) return;

		if (e.repeat) return;
		if (options.key === "Space") e.preventDefault();

		if (tl.paused()) {
			// If finished, replay from start; otherwise resume
			if (tl.progress() === 1) tl.restart();
			else tl.play();
		} else {
			tl.pause();
		}
	});
}


/**
 * Prepares the Diogo Stilwell logo SVG for animations:
 * - Ensures a stable SVG id (#ds-logo)
 * - Collects letter paths and the dot by known IDs
 * - Applies CSS hook classes to letters and dot
 *
 * @export
 * @param {SVGElement} svg
 * @returns {{ letters: SVGElement[], dot: SVGElement|null }}
 */
export function dsLogoPrepare(svg) {
	if (!(svg instanceof SVGElement)) {
		throw new TypeError("dsLogoPrepare: expected an SVGElement.");
	}

	if (!svg.getAttribute("id")) svg.setAttribute("id", "ds-logo");

	const letterIds = [
		"ds-logo-letter-s",
		"ds-logo-letter-t",
		"ds-logo-letter-i",
		"ds-logo-letter-l1",
		"ds-logo-letter-w",
		"ds-logo-letter-e",
		"ds-logo-letter-l2",
		"ds-logo-letter-l3"
	];

	const dotId = "ds-logo-letter-i-dot";

	const letters = letterIds
		.map((id) => svg.querySelector(`#${id}`))
		.filter(Boolean);

	const dot = svg.querySelector(`#${dotId}`);

	letters.forEach((el) => el.classList.add("ds-logo-letter"));
	if (dot) dot.classList.add("ds-logo-letter-dot");

	return { letters, dot };
}
