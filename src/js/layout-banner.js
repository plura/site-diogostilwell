function DSHeroBanner({ title }) {

	const gsap = window.gsap;
	const SplitText = window.SplitText;

	if (!gsap || !SplitText || !title) return;

	const split = new SplitText(title, { type: "words" });

	const tl = gsap.timeline({
		delay: 0.45,
		onReverseComplete: () => split.revert()
	});

	gsap.set(split.words, {
		opacity: 0,
		y: 20
	});

	tl.to(split.words, {
		opacity: 1,
		y: 0,
		duration: 0.8,
		stagger: { each: 0.22, from: "start" },
		ease: "power3.out",
		clearProps: "opacity,transform"
	});

	return tl;

}

function DSIntroInit() {

	// Create intro div holder
	const introHolder = document.createElement("div");
	introHolder.className = "ds-intro__holder";

	// Create Stilwell text element
	const stilwellElement = document.createElement("h1");
	stilwellElement.className = "ds-intro__title";
	stilwellElement.textContent = "Stilwell";

	// Append Stilwell element to holder
	introHolder.appendChild(stilwellElement);

	// Apply DSHeroBanner animation to Stilwell element
	const tl = DSHeroBanner({ title: stilwellElement });

	// When timeline completes, add completion class to intro holder
	if (tl) {
		tl.eventCallback("onComplete", () => {
			introHolder.classList.add("ds-intro__complete");
		});
	}

	return introHolder;

}
