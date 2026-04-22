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


	//GLobals: Countdown
	const countdownholder = document.getElementById('ds-countdown-holder');

	if (countdownholder) {

		DSCountdown({ target: countdownholder, enddate: COUNTDOWN_DATE, animated: true });

	}


	//Globals: Awards - add labels to Awards icons
	varToAttr({ key: 'ds-award-name', target: '.ds-awards .ds-award' });


	// Globals CPT: Header & Hero Banner H1 Heights 
	const heroH1 = document.querySelector("#ds-hero-banner h1");

	if (heroH1) {

		DSHeroBanner({ title: heroH1 });

	}


	//Layouts: Theme Mode Toggle
	DSThemeModeToggle({ trigger: 'header :is(.header-nav, .header-menu) a[href="#thememode"]' });


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
			onReverseEnd: redirect,
			removeOnComplete: true
		});

	}

	//Pages: Work (Squarespace does not allow me to add classes, so adding them via JS)
	const project_cards = document.querySelectorAll(':root:not(:has(#ds-hero-banner)) section:has(.ds-project-info)');

	project_cards.forEach((card) => card.classList.add('ds-project-card'));

});