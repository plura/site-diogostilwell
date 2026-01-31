// Concatenated code export
// Source (dir): src/js
// Excluded (names): node_modules,vendor,.git,dist,build,.ddev,.idea,.vscode,.next,.turbo,.cache,.pnpm-store
// Excluded (paths): 
// Generated: 2026-01-31T02:17:23+00:00
// Extensions: js
// Chunk: 1
// -------------------------------------------------

// -------------------------------------------------
//  src/js/init.js
// -------------------------------------------------

// src/js/init.js

const

	COUNTDOWN_DATE = '2026-05-22',

	IDS = {
		case: "project-case",
		campaign: "project-campaign",
		board: "project-board",
		extraBoards: "project-extra-boards",
		supportingMaterials: "project-supporting-materials",
		onTheStreets: "project-on-the-streets",
		stills: "project-stills",
	};


document.addEventListener("DOMContentLoaded", function () {

	// Globals: Carousel + Fancybox integration
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

	/* 	const resize = new ResizeObserver(entries => { setVars(); });
	
		resize.observe(document.body); */


	//GLobals: Countdown
	const countdownholder = document.getElementById('ds-countdown-holder');

	if (countdownholder) {

		DSCountdown({ target: countdownholder, enddate: COUNTDOWN_DATE, animated: true });

	}


	//Globals: Awards - add labels to Awards icons
	varToAttr({ key: 'ds-award-name', target: '.ds-awards .ds-award' });


	// Globals CPT: Header & Hero Banner H1 Heights 
	const header = document.querySelector("header");
	const heroH1 = document.querySelector("#hero-banner h1");
	const elements = new Map();

	const updateHeights = (entries) => {
		entries.forEach((entry) => {

			const meta = elements.get(entry.target);
			if (!meta) return;

			setVars({
				[`${meta.id}-h`]: `${entry.target.offsetHeight}px`
			});

		});
	};

	const ro = new ResizeObserver(updateHeights);

	[
		{ obj: header, id: "header" },
		{ obj: heroH1, id: "hero-banner-h1" }
	].forEach((item) => {
		if (!item.obj) return;

		elements.set(item.obj, { id: item.id });

		ro.observe(item.obj);
	});


	// Pages: Intro Animation
	const ds_logo_intro = document.querySelector('svg#ds-logo-intro');

	if (ds_logo_intro) {

		const nextUrl = '/work/';

		let didRedirect = false;

		const redirect = () => {

			if (didRedirect) return;
			didRedirect = true;
			window.location.assign(nextUrl);

		};

		// start warming cache as soon as the animation starts
		fetch(nextUrl, { credentials: "same-origin" }).catch(() => { });

		animinit(ds_logo_intro, animintro, {
			delay: .5,
			onTurnaround: (tl) => {
				tl.timeScale(1.5);
				document.body.addEventListener('click', redirect, { once: true });
			},
			onReverseEnd: redirect
		});

	}



});

// -------------------------------------------------
//  src/js/layout-countdown.js
// -------------------------------------------------

/**
 * Factory for a single digit slot
 * BEM: ds-countdown__digit
 */
function DSCountdownItemValueDigit({ parentEl, animated }) {
  let currentDigit = null;
  const container = document.createElement('span');
  container.className = 'ds-countdown__digit';
  
  let strip, currentSlot, nextSlot;

  if (animated) {
    strip = document.createElement('span');
    strip.className = 'ds-countdown__digit-strip';
    
    currentSlot = document.createElement('span');
    currentSlot.className = 'ds-countdown__digit-strip-item ds-countdown__digit-strip-item--current';
    
    nextSlot = document.createElement('span');
    nextSlot.className = 'ds-countdown__digit-strip-item ds-countdown__digit-strip-item--next';
    
    strip.append(currentSlot, nextSlot);
    container.appendChild(strip);
  } else {
    // Static mode uses a single slot centered in the fixed-width container
    currentSlot = document.createElement('span');
    currentSlot.className = 'ds-countdown__digit-static';
    container.appendChild(currentSlot);
  }

  parentEl.appendChild(container);

  return {
    update: function(newDigit) {
      if (newDigit === currentDigit) return;

      if (!animated || currentDigit === null) {
        currentSlot.textContent = newDigit;
      } else {
        nextSlot.textContent = newDigit;
        gsap.to(strip, {
          yPercent: -50,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            currentSlot.textContent = newDigit;
            gsap.set(strip, { yPercent: 0 });
          }
        });
      }
      currentDigit = newDigit;
    }
  };
}

/**
 * Factory for the Value component
 */
function DSCountdownItemValue({ parentEl, leadingZero, animated }) {
  const container = document.createElement('span');
  container.className = 'ds-countdown__value';
  parentEl.appendChild(container);

  let digits = [];

  // Always create digit containers if leadingZero is true to ensure layout stability
  if (leadingZero) {
    digits = [
        DSCountdownItemValueDigit({ parentEl: container, animated }), 
        DSCountdownItemValueDigit({ parentEl: container, animated })
    ];
  }

  return {
    update: function(newValue) {
      const displayValue = leadingZero 
        ? String(newValue).padStart(2, '0') 
        : String(newValue);
      
      if (leadingZero) {
        displayValue.split('').forEach((char, i) => {
          if (digits[i]) digits[i].update(char);
        });
      } else {
        if (container.textContent !== displayValue) {
          container.textContent = displayValue;
        }
      }
    }
  };
}

/**
 * Factory for individual countdown units
 */
function DSCountdownItem({ unit, parentEl, showLabel, leadingZero, animated }) {
  const itemEl = document.createElement('div');
  itemEl.className = `ds-countdown__item ds-countdown__item--${unit}`;

  const valueController = DSCountdownItemValue({ 
    parentEl: itemEl, 
    leadingZero, 
    animated 
  });

  if (showLabel) {
    const labelEl = document.createElement('span');
    labelEl.className = 'ds-countdown__label';
    labelEl.textContent = unit;
    itemEl.appendChild(labelEl);
  }

  parentEl.appendChild(itemEl);
  return { update: (val) => valueController.update(val) };
}

/**
 * Main Countdown Factory
 */
function DSCountdown({
  startdate = false,
  enddate,
  target = false,
  label = true,
  leadingZero = true,
  animated = false,
  class: className = false,
  months = true,
  days = true,
  hours = true,
  minutes = true,
  seconds = true
}) {
  if (!enddate) return null;
  const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetEl) return null;

  targetEl.innerHTML = ''; 
  const container = document.createElement('div');
  container.className = 'ds-countdown';
  if (className) container.classList.add(...className.split(' ').filter(Boolean));
  targetEl.appendChild(container);

  const activeItems = {};
  const config = { months, days, hours, minutes, seconds };
  
  Object.entries(config).forEach(([unit, active]) => {
    if (active) {
      activeItems[unit] = DSCountdownItem({ unit, parentEl: container, showLabel: label, leadingZero, animated });
    }
  });

  let rafId = null;
  function tick() {
    const now = startdate ? new Date(startdate).getTime() : new Date().getTime();
    const distance = new Date(enddate).getTime() - now;

    if (distance <= 0) {
      container.innerHTML = '<div class="ds-countdown__expired">Expired</div>';
      return;
    }

    const values = {
      months: Math.floor(distance / (1000 * 60 * 60 * 24 * 30.44)),
      days: Math.floor((distance % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };

    Object.keys(activeItems).forEach(u => activeItems[u].update(values[u]));
    if (!startdate) rafId = requestAnimationFrame(tick);
  }

  tick();
  return { stop: () => cancelAnimationFrame(rafId) };
}

// -------------------------------------------------
//  src/js/layout-intro.js
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

function setVars(params = {}) {

	const obj = { ...params };

	Object.entries(obj).forEach(([key, value]) => {

		const obj = typeof value === 'object' ? value : { target: document.documentElement, value: value };

		obj.target.style.setProperty(`--ds-${key}`, obj.value);

	});

}



const getVar = (key, target = document.body) => {
	if (!target || !(target instanceof HTMLElement) || typeof key !== "string") return null;

	const prop = key.startsWith("--") ? key : `--${key}`;
	const value = getComputedStyle(target).getPropertyValue(prop).trim();

	return value || null;
};

const parseElement = (target) => {
	if (typeof target === "string") {
		target = document.querySelectorAll(target);
	}

	return target instanceof HTMLElement
		? [target]
		: target instanceof NodeList || target instanceof HTMLCollection
			? Array.from(target)
			: [];
};

const varToAttr = ({ key, target = document.body }) => {
	parseElement(target).forEach((element) => {
		const value = getVar(key, element); // pass "foo", getVar makes it "--foo"
		if (value != null && value !== "") {
			const sanitizedValue = value.replace(/^(['"])(.*)\1$/, "$2");
			element.setAttribute(`data-${key}`, sanitizedValue);
		}
	});
};


