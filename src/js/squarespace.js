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