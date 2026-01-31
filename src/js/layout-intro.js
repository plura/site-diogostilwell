//src/js/intro.js

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
function animinit(svg, animation, options = { delay: 0, paused: false, key: false, onEnd: false, onReverseEnd: false, onTurnaround: false }) {
	if (!animation) return;


	const { delay, paused, onTurnaround } = options;
	const tl = animation(svg, { delay, paused, onTurnaround });
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
function dsLogoPrepare(svg) {
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


/**
 * Builds Animation 3 timeline: letters appear one-by-one (slide/fade) →
 * dot punctuation → hold → rewind back to start.
 *
 * @param {SVGElement} svg - The inlined logo SVG element.
 * @param {Object} [options]
 * @param {number} [options.delay=0] - Delay (in seconds) before the timeline starts.
 * @param {boolean} [options.paused=false] - Whether the timeline starts paused.
 * @param {number} [options.hold] - Optional hold duration (in seconds), used by animations that support a hold phase.
 * @param {Function|null} [options.onTurnaround=null] - Callback fired when the timeline reaches the turnaround point (before rewind).
 * @returns {gsap.core.Timeline|undefined} The GSAP timeline, or undefined if GSAP is not available.
 */
function animintro(svg, options = { delay: 0, hold: 0.8, paused: false, onTurnaround: null }) {
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

		if (typeof options.onTurnaround === "function") {
			options.onTurnaround(tl);   // <-- external control point
		}

		tl.reverse();
	});

	// Lock back to initial state after rewind completes
	tl.eventCallback("onReverseComplete", () => {
		gsap.set(letters, init_val_letters);
		if (dot) gsap.set(dot, init_val_dot);
	});

	return tl;
}






