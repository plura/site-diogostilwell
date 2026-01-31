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