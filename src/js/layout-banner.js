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
