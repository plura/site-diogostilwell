// src/js/init.js

const IDS = {
	case: "project-case",
	campaign: "project-campaign",
	board: "project-board",
	extraBoards: "project-extra-boards",
	supportingMaterials: "project-supporting-materials",
	onTheStreets: "project-on-the-streets"
};


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

		let didRedirect = false;

		const redirect = () => {

			if (didRedirect) return;
			didRedirect = true;
			window.location.assign(new URL("/work/", window.location.href));

		};

		animinit(ds_logo_intro, animintro, {
			delay: 2,
			onEnd: () => document.body.addEventListener('click', redirect, { once: true }),
			onReverseEnd: redirect
		});

	}

	// Work Countdown
	const countdownholder = document.getElementById('ds-countdown-holder');

	if (countdownholder) {

		DSCountdown({target: countdownholder, enddate: '2026-06-17', animated: true});

	}

});