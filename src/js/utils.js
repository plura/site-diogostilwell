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


/**
 * Initializes a theme mode toggle that switches the document theme between "light" and "dark".
 *
 * - Persists the user's choice in localStorage under the "theme" key.
 * - Applies the current theme via `data-theme` on `document.documentElement`.
 * - If no stored/manual theme is present, falls back to the system preference.
 *
 * @param {Object} [options]
 * @param {string|HTMLElement|NodeList|HTMLElement[]} options.trigger
 *   CSS selector string, HTMLElement, NodeList, or array of HTMLElements used as toggle triggers.
 * @returns {void}
 */
function DSThemeModeToggle({ trigger } = {}) {
	const elements = parseElement(trigger);
	if (elements.length === 0) return;

	const root = document.documentElement;

	const getSystemTheme = () =>
		window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

	const getCurrentTheme = () => {
		return (
			localStorage.getItem("theme") ||
			root.getAttribute("data-theme") ||
			getSystemTheme()
		);
	};

	const setTheme = (type) => {
		root.setAttribute("data-theme", type);
		localStorage.setItem("theme", type);
		elements.forEach((el) => {
			el.classList.remove("ds-theme-light", "ds-theme-dark");
			el.classList.add(`ds-theme-${type}`);
		});
	};

	// Initialize initial state
	setTheme(getCurrentTheme());

	elements.forEach((el) => {
		el.addEventListener("click", (e) => {
			e.preventDefault();
			const next = getCurrentTheme() === "dark" ? "light" : "dark";
			setTheme(next);
		});
	});
}
