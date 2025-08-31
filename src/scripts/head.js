window.wait = async function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

window.getAnimationDuration = function getAnimationDuration(el) {
	const style = window.getComputedStyle(el);
	return parseFloat(style.animationDuration) * 1000 || 2000;
}

window.skipLoad = false;

window.loadProcessor = class LoadProcessor {

	constructor() { }

	static loading = false;

	static async waitForLoad() {
		return new Promise(async (resolve) => {
			do {
				// nothing
			} while (this.isLoading());
			resolve();
		});
	}

	static isLoading() {
		return this.loading;
	}

	static setLoading(loading = true) {
		this.loading = loading;
	}

	static getMorphTargetRect() {
		if (window.innerWidth <= 700) {
			const img = document.getElementById('loader-titlecard');
			let aspect = 0.32;
			if (img && img.naturalWidth && img.naturalHeight) {
				aspect = img.naturalHeight / img.naturalWidth;
			}
			const width = window.innerWidth * 0.6;
			const height = width * aspect;
			const navbar = document.querySelector('.at-navbar');
			const navbarRect = navbar ? navbar.getBoundingClientRect() : { top: 0 };
			return {
				left: window.innerWidth / 2 - width / 2,
				top: navbarRect.top,
				width,
				height
			};
		} else {
			const desktopTitlecard = document.querySelector('.at-navbar .at-titlecard');
			if (desktopTitlecard) return desktopTitlecard.getBoundingClientRect();
			return navRect;
		}
	}

	static async start() {
		if (window.skipLoad) return this.skipLoad();
		if (this.isLoading()) return;
		this.setLoading();

		const loader = document.getElementById('loader-overlay');
		const icon = document.getElementById('loader-icon');
		const titlecard = document.getElementById('loader-titlecard');
		const animContainer = document.getElementById('loader-anim-container');
		const navbarTitlecard = document.querySelector('.at-titlecard');
		const navRect = navbarTitlecard?.getBoundingClientRect();
		if (!(loader && icon && titlecard && animContainer && navbarTitlecard && navRect)) return;

		let currentNavRect = this.getMorphTargetRect();
		window.addEventListener('resize', () => {
			currentNavRect = this.getMorphTargetRect();
		});

		const initialScale = 0.5;
		titlecard.style.width = currentNavRect.width * initialScale + 'px';
		titlecard.style.height = currentNavRect.height * initialScale + 'px';
		titlecard.style.left = '50%';
		titlecard.style.top = '50%';
		titlecard.style.transform = 'translate(-50%, -50%)';
		titlecard.style.position = 'absolute';
		titlecard.style.opacity = '0';

		const duration = window.getAnimationDuration(icon);
		const computedStyle = window.getComputedStyle(icon);
		const animationName = computedStyle.animationName;
		let elapsed = 0;
		if (animationName && animationName !== 'none') {
			const anim = icon.getAnimations()[0];
			if (anim && anim.currentTime) {
				elapsed = anim.currentTime % duration;
			} else {
				elapsed = 0;
			}
		}
		const waitTime = duration - elapsed;
		await window.wait(waitTime - 50);

		icon.style.outline = 'none';
		icon.classList.remove('loading');
		icon.style.visibility = 'hidden';
		icon.style.display = 'block';
		const rect = icon.getBoundingClientRect();
		icon.style.width = rect.width + 'px';
		icon.style.height = rect.height + 'px';
		icon.style.boxSizing = 'border-box';
		icon.style.left = '50vw';
		icon.style.top = '50vh';
		icon.style.transformOrigin = '50% 50%';
		icon.style.position = 'fixed';
		icon.style.zIndex = '11000';
		icon.style.willChange = 'transform';
		icon.style.opacity = '0.7';
		icon.style.animation = 'none';
		icon.style.removeProperty('transition');
		icon.style.setProperty('transition', 'transform 0.5s ease, opacity 0.3s', 'important');
		icon.style.transform = 'translate(-50%, -50%) scale(0.5)';
		if (icon.parentElement !== document.body) {
			document.body.appendChild(icon);
		}
		void icon.offsetWidth;
		icon.style.visibility = 'visible';
		icon.style.transform = 'translate(-50%, -50%) scale(0)';
		await window.wait(150);
		titlecard.style.transition = 'opacity 1.2s, width 1.2s, height 1.2s';
		titlecard.style.opacity = '1';
		titlecard.style.width = currentNavRect.width + 'px';
		titlecard.style.height = currentNavRect.height + 'px';
		await window.wait(250);
		icon.style.opacity = '0';
		await window.wait(1000);

		const navRectForMove = this.getMorphTargetRect();
		const viewportCenterX = window.innerWidth / 2;
		let moveX;
		if (window.innerWidth <= 700) {
			moveX = navRectForMove.left + navRectForMove.width / 2 - viewportCenterX;
			titlecard.style.transition = 'top 1.2s ease, transform 1.2s ease';
			titlecard.style.top = navRectForMove.top + 'px';
			titlecard.style.transform = `translateX(-50%) translateX(${moveX}px)`;
		} else {
			const navCenterX = navRectForMove.left + navRectForMove.width / 2;
			const navCenterY = navRectForMove.top + navRectForMove.height / 2;
			const viewportCenterY = window.innerHeight / 2;
			moveX = navCenterX - viewportCenterX;
			const moveY = navCenterY - viewportCenterY;
			titlecard.style.transition = 'transform 1.2s ease';
			titlecard.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
		}
		await window.wait(1200);

		const floatingTitlecard = titlecard.cloneNode(true);
		floatingTitlecard.id = 'floating-loader-titlecard';
		floatingTitlecard.style.position = 'fixed';
		if (window.innerWidth <= 700) {
			floatingTitlecard.style.width = '60vw';
			floatingTitlecard.style.maxWidth = '90vw';
			floatingTitlecard.style.minWidth = '100px';
			floatingTitlecard.style.left = '50%';
			floatingTitlecard.style.transform = 'translateX(-50%)';
			const navbar = document.querySelector('.at-navbar');
			const navbarRect = navbar ? navbar.getBoundingClientRect() : { top: 0 };
			floatingTitlecard.style.top = navbarRect.top + 'px';
		}
		else {
			const floatRect = this.getMorphTargetRect();
			floatingTitlecard.style.left = floatRect.left + 'px';
			floatingTitlecard.style.top = floatRect.top + 'px';
			floatingTitlecard.style.width = floatRect.width + 'px';
			floatingTitlecard.style.height = floatRect.height + 'px';
			floatingTitlecard.style.transform = 'none';
		}
		floatingTitlecard.style.transition = 'opacity 0.6s';
		floatingTitlecard.style.zIndex = '10001';
		document.body.appendChild(floatingTitlecard);
		titlecard.style.opacity = '0';
		navbarTitlecard.style.opacity = '1';
		animContainer.style.transition = 'opacity 1.2s';
		animContainer.style.opacity = '0';
		loader.classList.add('hidden');
		setTimeout(() => {
			floatingTitlecard.style.opacity = '0';
		}, 100);
		setTimeout(() => {
			if (floatingTitlecard && floatingTitlecard.parentNode) floatingTitlecard.parentNode.removeChild(floatingTitlecard);
			loader.style.display = 'none';
			this.finishLoad();
		}, 800);
		document.body.classList.add('show-content');
		this.loadTitle();
	}

	static skipLoad() {
		const loader = document.getElementById('loader-overlay');
		if (loader) {
			loader.classList.add('hidden');
			loader.style.display = 'none';
			document.body.classList.add('show-content');
			// Ensure navbar titlecard is visible immediately
			/** @type {HTMLElement} */
			const navbarTitlecard = document.querySelector('.at-titlecard');
			if (navbarTitlecard) {
				navbarTitlecard.style.removeProperty('transition');
				navbarTitlecard.style.opacity = '1';
			}
			// Hide the loader icon immediately
			const icon = document.getElementById('loader-icon');
			if (icon) {
				icon.style.removeProperty('transition');
				icon.style.display = 'none';
				icon.style.visibility = 'hidden';
			}
			const floatingTitlecard = document.getElementById('floating-loader-titlecard');
			if (floatingTitlecard && floatingTitlecard.parentNode) {
				floatingTitlecard.parentNode.removeChild(floatingTitlecard);
			}
		}
		this.finishLoad();
	}

	static loadTitle() {
		const url = new URL(window.location.href);
		const path = url.pathname.replace(/\/+$/, '');
		let pageTitle = path.slice(1).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).toString();
		if (/^(home|\/)?$/i.test(pageTitle.toLowerCase())) pageTitle = 'Home';
		if (/(\/|)about/.test(pageTitle.toLowerCase())) pageTitle = 'About Us';
		document.title = `AvengeTech${pageTitle !== false ? ` - ${pageTitle}` : ''}`;
	}

	static async finishLoad() {
		this.setLoading(false);
		this.loadTitle();
	}
}

document.addEventListener('DOMContentLoaded', function () {
	document.title = "AvengeTech - Loading...";
	if (!document.getElementById('loader-overlay')) {
		const loaderOverlay = document.createElement('div');
		loaderOverlay.id = 'loader-overlay';
		loaderOverlay.innerHTML = `
			<div id="loader-anim-container">
				<img id="loader-icon" class="loading" src="https://${window.cdnHost}/icon.png" alt="AvengeTech Icon" />
				<img id="loader-titlecard" src="https://${window.cdnHost}/titlecard.png" alt="AvengeTech Titlecard" />
			</div>
		`;
		document.body.prepend(loaderOverlay);
	}

	window.addEventListener('load', async () => {
		if (!sessionStorage.getItem('hasSeenLoader')) {
			await window.loadProcessor.start();
			sessionStorage.setItem('hasSeenLoader', 'true');
		} else {
			window.skipLoad = true;
			window.loadProcessor.start();
		}
	});

	window.addEventListener('close', () => {
		sessionStorage.clear();
	});
	window.addEventListener('beforeunload', function (e) {
		// Only clear sessionStorage if navigating away from this origin (not for same-origin navigation)
		const a = document.activeElement;
		let nextUrl = '';
		if (a && a.tagName === 'A' && a.href) {
			nextUrl = a.href;
		}
		if (nextUrl && !nextUrl.startsWith(window.location.origin)) {
			sessionStorage.clear();
		}
		// If the tab is being closed (not a navigation), clear sessionStorage
		if (!nextUrl) {
			sessionStorage.clear();
		}
	});
});

// Prevent right-click context menu on images
window.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('img, .at-titlecard, .panel-thumbnail, .panel-image').forEach(function (img) {
		img.addEventListener('contextmenu', function (e) {
			e.preventDefault();
		});
		img.setAttribute('draggable', 'false');
	});
});