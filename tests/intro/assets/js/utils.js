// tests/anim/assets/js/utils.js

/**
 * Loads an <img> pointing to an SVG file, fetches the SVG markup, and replaces
 * the <img> with an inline <svg> element (so GSAP can target IDs/paths).
 *
 * @param {HTMLImageElement|string} imgOrSelector - <img> element or selector.
 * @param {{
 * 	attrs?: boolean,
 * 	fetchOpts?: RequestInit
 * }} [opts]
 * @returns {Promise<SVGElement>}
 */
export async function inlineSvgFromImg(imgOrSelector, opts = {}) {
	const img = (typeof imgOrSelector === "string")
		? document.querySelector(imgOrSelector)
		: imgOrSelector;

	if (!(img instanceof HTMLImageElement)) {
		throw new Error("inlineSvgFromImg: img element not found / invalid.");
	}

	const src = img.getAttribute("src") || "";
	if (!src) throw new Error("inlineSvgFromImg: <img> has no src.");

	const res = await fetch(src, { cache: "no-cache", ...(opts.fetchOpts || {}) });
	if (!res.ok) {
		throw new Error(`inlineSvgFromImg: failed to fetch "${src}" (${res.status}).`);
	}

	const text = await res.text();

	const parser = new DOMParser();
	const doc = parser.parseFromString(text, "image/svg+xml");
	const svg = doc.querySelector("svg");

	if (!svg) throw new Error("inlineSvgFromImg: fetched file is not valid SVG.");

	const svgNode = document.importNode(svg, true);

	if (opts.attrs !== false) {
		["alt", "class", "height", "id", "width"].forEach((attrName) => {
			const val = img.getAttribute(attrName);
			if (val === null) return;

			if (attrName === "alt") {
				if (val === "") {
					// Decorative image
					svgNode.setAttribute("aria-hidden", "true");
				} else {
					svgNode.setAttribute("role", "img");
					svgNode.setAttribute("aria-label", val);
				}
				return;
			}

			if (val !== "") svgNode.setAttribute(attrName, val);
		});
	}

	img.replaceWith(svgNode);

	return svgNode;
}