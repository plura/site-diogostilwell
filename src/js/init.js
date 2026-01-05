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