import express from 'express';
import { MySQLProvider } from '../../mysql/MySQLProvider.js';
import { RuntimeObfuscator } from '../../utils/RuntimeObfuscator.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WebApp {

	static #instance = null;
	static getInstance() {
		return this.#instance;
	}

	/** @type {https.Server} */
	httpsServer;

	/** @type {express.Express} */
	app;
	/** @type {MySQLProvider} */
	mysql;

	/** @type {string[]} */
	validTokens = [];

	/**
	 * @param {MySQLProvider} mysql
	 */
	constructor(mysql) {
		if (WebApp.#instance) {
			throw new Error("WebApp is a singleton and has already been instantiated.");
		}
		WebApp.#instance = this;
		this.mysql = mysql;
		this.app = express();
		this.app.use(express.json());

		// CORS middleware for all requests
		this.app.use((req, res, next) => {
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
			res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
			res.setHeader("Access-Control-Allow-Credentials", "true");
			if (req.method === "OPTIONS") {
				res.status(204).end();
				return;
			}
			next();
		});

		// Restore main request processing
		this.app.use(async (req, res, next) => {
			switch (req.subdomains[0]) {
				case "api":
					if (
						(["POST", "PUT", "DELETE"].includes(req.method) && this.hasValidToken(req)) ||
						req.path.endsWith("/login") ||
						req.path.endsWith("/create") ||
						req.path.endsWith("/forgot-pass") ||
						/^\/(style|script)(s|)/.test(req.path)
					) this.apiRequest(req.path, req, res);
					break;
				case "cdn":
					this.cdnRequest(req.path, req, res);
					break;
				default:
					this.request(req.path, req, res);
					break;
			}
			next();
		});


		this.app.listen(80, () => {
			console.log("WebApp unsecure server running at :80");
		});
		if (fs.existsSync("/[REDACTED]/domain.key") && fs.existsSync("/[REDACTED]/domain.crt")) {
			const sslOptions = {
				key: fs.readFileSync("/[REDACTED]/domain.key").toString(),
				cert: fs.readFileSync("/[REDACTED]/domain.crt").toString(),
			};
			this.httpsServer = https.createServer(sslOptions, this.app);
			this.httpsServer.listen(443, () => {
				console.log("WebApp secure server running at :443");
			});
		} else if (fs.existsSync("[REDACTED]\\domain.key") && fs.existsSync("[REDACTED]\\domain.crt")) {
			const sslOptions = {
				key: fs.readFileSync("[REDACTED]\\domain.key").toString(),
				cert: fs.readFileSync("[REDACTED]\\domain.crt").toString(),
			};
			this.httpsServer = https.createServer(sslOptions, this.app);
			this.httpsServer.listen(443, () => {
				console.log("WebApp secure server running at :443");
			});
		}

	}

	/**
	 * Called when an API request is made.
	 * 
	 * @param {string} rp - The request path.
	 * @param {express.Request} req - The request object.
	 * @param {express.Response} res - The response object.
	 * @returns {void}
	 */
	async apiRequest(rp, req, res) {
		switch (true) {
			case /^\/script(s|)/.test(rp):
				if (req.method !== "GET") {
					res.setHeader("Content-Type", "application/json");
					res.status(405).json({ error: "Method Not Allowed" });
					break;
				}
				const pathToScript = path.join(__dirname, "../../scripts", rp.replace(/^\/script(s|)/, ""));
				if (!fs.existsSync(pathToScript)) {
					res.setHeader("Content-Type", "application/javascript");
					res.status(404).send("// Script Not Found");
					break;
				}
				const scriptContent = fs.readFileSync(pathToScript, "utf-8");
				const obfuscatedScript = RuntimeObfuscator.obfuscateJS(scriptContent).getObfuscatedCode();
				res.setHeader("Content-Type", "application/javascript");
				res.send(obfuscatedScript);
				break;
			case /^\/style(s|)/.test(rp):
				if (req.method !== "GET") {
					res.setHeader("Content-Type", "application/json");
					res.status(405).json({ error: "Method Not Allowed" });
					break;
				}
				const pathToStyle = path.join(__dirname, "../../css", rp.replace(/^\/style(s|)/, ""));
				if (!fs.existsSync(pathToStyle)) {
					res.setHeader("Content-Type", "text/css");
					res.status(404).send("/* Style Not Found */");
					break;
				}
				const styleContent = fs.readFileSync(pathToStyle, "utf-8");
				res.setHeader("Content-Type", "text/css");
				res.send(styleContent);
				break;
			case /^\/accounts\//.test(rp):
				rp = rp.replace(/^\/accounts\//, "");
				var skipToken = /^(login|create|forgot-pass)/.test(rp);
				if (!skipToken && !this.hasValidToken(req)) {
					res.setHeader("Content-Type", "application/json");
					res.status(401).json({ error: "Unauthorized" });
					break;
				}
			default:
				res.setHeader("Content-Type", "application/json");
				res.status(404).json({ error: "Not Found" });
				break;
		}
	}

	/**
	 * Called when a CDN request is made.
	 * 
	 * @param {string} rp - The request path.
	 * @param {express.Request} req - The request object.
	 * @param {express.Response} res - The response object.
	 * @returns {void}
	 */
	async cdnRequest(rp, req, res) {
		switch (true) {
			case req.method !== "GET":
				res.status(405).send("Method Not Allowed");
				break;
			default:
				const ptf = path.join(__dirname, "../../assets", rp);
				if (!fs.existsSync(ptf) || !fs.lstatSync(ptf).isFile()) {
					res.status(404).send("File Not Found");
					console.error("File not found:", ptf);
					break;
				}
				const fileContent = fs.readFileSync(ptf);
				const ext = path.extname(ptf).toLowerCase();
				let contentType = null;
				switch (ext) {
					case ".png":
						contentType = "image/png";
						break;
					case ".jpg":
					case ".jpeg":
						contentType = "image/jpeg";
						break;
					case ".gif":
						contentType = "image/gif";
						break;
					case ".svg":
						contentType = "image/svg+xml";
						break;
					case ".mp4":
						contentType = "video/mp4";
						break;
					case ".webm":
						contentType = "video/webm";
						break;
					case ".ogg":
						contentType = "audio/ogg";
						break;
					case ".mp3":
						contentType = "audio/mpeg";
						break;
					case ".wav":
						contentType = "audio/wav";
						break;
				}
				if (!contentType) {
					res.status(415).send("Unsupported Media Type\n" + JSON.stringify({ ext }, null, "\t"));
					break;
				}
				res.setHeader("Content-Type", contentType);
				res.setHeader("Cache-Control", "public, max-age=31536000");
				res.setHeader("Content-Length", fileContent.length);
				res.status(200).send(fileContent);
				break;
		}
	}

	/**
	 * Calls when a request is made to the web app.
	 *
	 * @param {string} rp - The request path.
	 * @param {express.Request} req - The request object.
	 * @param {express.Response} res - The response object.
	 * @returns {void}
	 */
	async request(rp, req, res) {
		if (rp.trim("/") === "") rp = "/home";
		let pathToFile = path.join(__dirname, "../../pages", rp);
		if (!fs.existsSync(pathToFile)) {
			pathToFile += ".html";
			if (!fs.existsSync(pathToFile)) {
				res.status(404).send("Page Not Found");
				return;
			}
		}
		let fileContent = fs.readFileSync(pathToFile, "utf-8");

		// --- Adaptive Resource Rewriting ---
		const domainMap = {
			"[REDACTED]": { api: "api.[REDACTED]", cdn: "cdn.[REDACTED]" },
			"[REDACTED]": { api: "api.[REDACTED]", cdn: "cdn.[REDACTED]" }
		};
		const host = req.headers.host || "[REDACTED]";
		let apiHost = "api.[REDACTED]";
		let cdnHost = "cdn.[REDACTED]";
		for (const domain in domainMap) {
			if (host.endsWith(domain)) {
				apiHost = domainMap[domain].api;
				cdnHost = domainMap[domain].cdn;
				break;
			}
		}

		// Simple placeholder replacement for resource URLs
		fileContent = fileContent
			.replace(/\{\{apiHost\}\}/g, `https://${apiHost}`)
			.replace(/\{\{cdnHost\}\}/g, `https://${cdnHost}`);

		if (rp.endsWith(".js")) {
			const obfuscatedScript = RuntimeObfuscator.obfuscateJS(fileContent).getObfuscatedCode();
			res.setHeader("Content-Type", "application/javascript");
			res.send(obfuscatedScript);
			return;
		}
		res.setHeader("Content-Type", "text/html");
		res.send(fileContent);
	}

	/**
	 * Generates a new token and adds it to the valid tokens list.
	 * 
	 * @returns {string} - Returns the generated token.
	 */
	generateToken() {
		const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		this.validTokens.push(token);
		return token;
	}

	/**
	 * @param {RequestInit} req 
	 * @returns {boolean}
	 */
	hasValidToken(req) {
		req.headers ??= {};
		const token = (req.headers.authorization ?? req.headers["Authorization"])?.split(" ")[1] ?? false;
		if (!token) return false;
		return this.isValidToken(token);
	}

	/**
	 * Checks if the provided token is valid.
	 * 
	 * @param {string} token - The token to check.
	 * @returns {boolean} - Returns true if the token is valid, false otherwise.
	 */
	isValidToken(token) {
		return this.validTokens.includes(token);
	}

	/**
	 * Invalidates the provided token.
	 * 
	 * @param {string} token - The token to invalidate.
	 */
	voidToken(token) {
		const index = this.validTokens.indexOf(token);
		if (index > -1) {
			this.validTokens.splice(index, 1);
		}
	}

	/**
	 * Refreshes the provided token by invalidating it and generating a new one.
	 * 
	 * @param {string} token - The token to refresh.
	 * @returns {string} - Returns the new token.
	 */
	refreshToken(token) {
		this.voidToken(token);
		return this.generateToken();
	}

}