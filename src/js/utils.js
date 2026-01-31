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

