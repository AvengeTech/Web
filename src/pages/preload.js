// Set window.apiHost and window.cdnHost for use by other scripts
(function () {
	const domainMap = {
		"[REDACTED]": { api: "api.[REDACTED]", cdn: "cdn.[REDACTED]" },
		"[REDACTED]": { api: "api.[REDACTED]", cdn: "cdn.[REDACTED]" }
	};
	const currentHost = window.location.hostname;
	window.apiHost = "api.[REDACTED]";
	window.cdnHost = "cdn.[REDACTED]";
	for (const domain in domainMap) {
		if (currentHost.endsWith(domain)) {
			window.apiHost = domainMap[domain].api;
			window.cdnHost = domainMap[domain].cdn;
			break;
		}
	}
})();