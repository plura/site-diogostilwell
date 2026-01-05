// Concatenated code export
// Source (dir): src/js
// Excluded (names): node_modules,vendor,.git,dist,build,.ddev,.idea,.vscode,.next,.turbo,.cache,.pnpm-store
// Excluded (paths): 
// Generated: 2026-01-05T01:46:16+00:00
// Extensions: js
// Chunk: 1
// -------------------------------------------------

// -------------------------------------------------
//  src/js/init.js
// -------------------------------------------------

// src/js/init.js

document.addEventListener("DOMContentLoaded", function () {

	// Carousel + Fancybox integration
	console.log('[DS/Fancybox] DOMContentLoaded');

	if (typeof Fancybox === "undefined") {
		console.log('[DS/Fancybox] Fancybox is undefined. Aborting.');
	} else {

		const DRAG_THRESHOLD = 6;
		const galleryBaseId = Date.now();

		console.log('[DS/Fancybox] Init. DRAG_THRESHOLD:', DRAG_THRESHOLD, 'galleryBaseId:', galleryBaseId);

		document.querySelectorAll('.user-items-list .user-items-list-carousel')
			.forEach((carousel, carouselIndex) => {

				const galleryName = `gallery-${galleryBaseId}-${carouselIndex}`;

				allowFancyBoxOnCarouselSlide({ carousel, fancyboxID: galleryName, threshold: DRAG_THRESHOLD });

			});

	}

	const resize = new ResizeObserver(entries => { setVars(); });

	resize.observe(document.body);


	// Intro Animation
	const ds_logo_intro = document.querySelector('svg#ds-logo-intro');

	if (ds_logo_intro) {

		animinit(ds_logo_intro, animintro, {
			delay: 2,
			onReverseEnd: () => {
				setTimeout(() => {
					window.location.assign(new URL("/works/", window.location.href));
				}, 1000);
			}
		});

	}

});

// -------------------------------------------------
//  src/js/intro.js
// -------------------------------------------------

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
function animinit(svg, animation, options = { delay: 0, paused: false, key: false, onEnd: false, onReverseEnd: false }) {
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
 * @returns {gsap.core.Timeline|undefined} The GSAP timeline, or undefined if GSAP is not available.
 */
function animintro(svg, options = {delay: 0, hold: 0.8, paused: false}) {
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







// -------------------------------------------------
//  src/js/squarespace.js
// -------------------------------------------------

function getClosestElementFromPoint(elements, clientX, clientY) {

	if (!elements.length) return null;

	let best = null;
	let bestDist = Infinity;

	for (const element of elements) {
		const rect = element.getBoundingClientRect();

		// If the click is vertically outside the element row, skip
		if (clientY < rect.top || clientY > rect.bottom) continue;

		// Distance from pointer X to the element's horizontal center
		const cx = rect.left + rect.width / 2;
		const dist = Math.abs(clientX - cx);

		if (dist < bestDist) {
			bestDist = dist;
			best = element;
		}
	}

	if (!best) {
		// fallback: pick the closest by X only (even if Y miss)
		for (const element of elements) {
			const rect = element.getBoundingClientRect();
			const cx = rect.left + rect.width / 2;
			const dist = Math.abs(clientX - cx);
			if (dist < bestDist) {
				bestDist = dist;
				best = element;
			}
		}
	}

	return best;
}


function allowFancyBoxOnCarouselSlide({ carousel, fancyboxID, threshold = 6 }) {

	console.log('[DS/Fancybox] Carousel found:', fancyboxID);

	const elements = carousel.querySelectorAll('.user-items-list-carousel__slide');
	const mediaEls = Array.from(carousel.querySelectorAll('.user-items-list-carousel__media'));
	console.log('[DS/Fancybox] Media elements found:', mediaEls.length);

	// Tag all media items for grouping
	mediaEls.forEach((media) => {
		media.setAttribute('data-fancybox', fancyboxID);
	});

	let startX = 0;
	let startY = 0;
	let isDown = false;

	// Capture phase so we see events even if Squarespace stops propagation later
	carousel.addEventListener('pointerdown', (e) => {
		isDown = true;
		startX = e.clientX;
		startY = e.clientY;

		console.log('[DS/Fancybox] pointerdown:', {
			fancyboxID,
			startX,
			startY,
			target: e.target,
			closestSlides: !!e.target.closest?.('.user-items-list-carousel__slides')
		});

	}, true);

	carousel.addEventListener('pointerup', (e) => {
		if (!isDown) return;
		isDown = false;

		const dx = Math.abs(e.clientX - startX);
		const dy = Math.abs(e.clientY - startY);
		const moved = Math.max(dx, dy);

		console.log('[DS/Fancybox] pointerup:', {
			fancyboxID,
			endX: e.clientX,
			endY: e.clientY,
			dx,
			dy,
			moved
		});

		// Drag? do nothing
		if (moved > threshold) {
			console.log('[DS/Fancybox] Drag detected, not opening Fancybox.', { fancyboxID, moved, threshold });
			return;
		}

		const element = getClosestElementFromPoint(elements, e.clientX, e.clientY);
		const media = element?.querySelector('.user-items-list-carousel__media');

		console.log('[DS/Fancybox] Click intent. Closest media:', media);

		if (!media) {
			console.log('[DS/Fancybox] No media resolved from point. Aborting.');
			return;
		}

		// Prevent "click" side effects, but only on click-intent
		e.preventDefault();
		e.stopPropagation();

		// Optional: open full gallery starting from clicked item
		const items = mediaEls.map((m) => ({ src: m.src, type: "image" }));
		const startIndex = mediaEls.indexOf(media);

		console.log('[DS/Fancybox] Opening gallery.', { fancyboxID, startIndex, total: items.length });

		Fancybox.show(items, {
			startIndex: Math.max(0, startIndex),
			groupAll: false
		});

	}, true);

	carousel.addEventListener('pointercancel', () => {
		isDown = false;
	}, true);

}

// -------------------------------------------------
//  src/js/utils.js
// -------------------------------------------------

function setVars( params = {} ) {

	const obj = { ...params };
	
	Object.entries(obj).forEach( ([key, value]) => {

		const obj = typeof value === 'object' ? value : {target: document.body, value: value};	

		obj.target.style.setProperty(`--ds-${ key }`, obj.value);

	} );

}

