class AccountManager {

	refreshToken = null;

	name = null;
	pfp = null;
	email = null;
	identifier = null;
	"2fa-identifier" = null;

	constructor() { }

	getName() {
		return this.name;
	}

	getPFP() {
		return this.pfp ?? `https://${window.cdnHost}/icon.png`;
	}

	getEmail() {
		return this.email ?? "support@[REDACTED]";
	}

	/**
	 * Checks if the password hash properly matches the account.
	 * @param {string} pass - The password to check.
	 * @return {Promise<boolean>} Returns true if the password hash is valid, false otherwise.
	 */
	async checkPassHash(pass) {
		return new Promise(async (resolve) => {
			if (this.refreshToken == null) return resolve(false);
			if (typeof pass !== "string" || pass.trim().length < 1) return resolve(false);
			const encoder = new TextEncoder();
			const data = encoder.encode(pass);
			window.crypto.subtle.digest('SHA-512', data).then(hashBuffer => {
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
				fetch("[REDACTED]", {
					'method': 'POST',
					'headers': {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${this.refreshToken}`
					},
					'body': JSON.stringify({
						password: hashHex
					})
				}).then(response => {
					response.json().then(data => {
						if (data.rftoken) {
							this.refreshToken = data.rftoken;
							window.sessionStorage.setItem('rftoken', this.refreshToken);
						}
						if (data.error) {
							return resolve(data.error);
						}
						resolve(data.valid);
					});
				}).catch(() => {
					resolve(false);
				});
			});
		});

	}

	/**
	 *  Fetches the account information from local storage.
	 * @param {string} username
	 * @param {string} pass
	 * @returns {Promise<{email:string,name:string,pfp:string}|string>} Returns the account information if successful, or an error message if not.
	 */
	async loadAccount(username, pass) {
		return new Promise(async (resolve) => {
			if (!username || !pass) {
				return resolve("Username and password are required.");
			}
			const encoder = new TextEncoder();
			const data = encoder.encode(pass);
			window.crypto.subtle.digest('SHA-512', data).then(hashBuffer => {
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
				fetch("[REDACTED]", {
					'method': 'POST',
					'headers': {
						"Content-Type": "application/json"
					},
					'body': JSON.stringify({
						username: username,
						passHash: hashHex,
						refreshToken: this.refreshToken
					})
				}).then(response => {
					response.json().then(data => {
						if (data.error) return resolve(data.error);
						if (!data.rftoken) return resolve("Failed to login. Please check your credentials.");
						this.refreshToken = data.rftoken;
						window.sessionStorage.setItem('rftoken', this.refreshToken);
						this.name = data.name;
						this.pfp = data.pfp;
						this.email = data.email;
						window.localStorage.setItem('account_email', username);
						window.localStorage.setItem('account_password', pass);
						resolve({
							email: this.email,
							name: this.name,
							pfp: this.pfp
						});
					}).catch(() => resolve("Failed to login. Please check your credentials."));
				}).catch(() => {
					resolve("Failed to login. Please check your credentials.");
				});
			});
		});
	}

	/**
	 * Creates a new account with the provided email, name, and password.
	 * This method hashes the password using SHA-512 before sending it to the server.
	 * @param {string} email - The email address for the new account.
	 * @param {string} name - The name for the new account.
	 * @param {string} pass - The password for the new account.
	 * @returns {Promise<boolean|string>} Returns true if the account was created successfully, or an error message if there was an issue.
	 */
	async createNewAccount(email, name, pass) {
		return new Promise(async (resolve) => {
			const encoder = new TextEncoder();
			const data = encoder.encode(pass);
			window.crypto.subtle.digest('SHA-512', data).then(hashBuffer => {
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
				fetch("[REDACTED]", {
					'method': 'POST',
					'headers': {
						"Content-Type": "application/json"
					},
					'body': JSON.stringify({
						email: email,
						name: name,
						pfp: "https://cdn.[REDACTED]/icon.png",
						password: hashHex
					})
				}).then(response => {
					response.json().then(data => {
						if (data.rftoken) {
							this.refreshToken = data.rftoken;
							window.sessionStorage.setItem('rftoken', this.refreshToken);
						}
						if (data.error) {
							return resolve(data.error);
						}
						window.localStorage.setItem('account_email', email);
						window.localStorage.setItem('account_password', pass);
						resolve(true);
					});
				}).catch(() => {
					resolve("An error occurred while creating the account.");
				});
			});
		});
	}

	/**
	 * Edit the current account's information.
	 * @param {{email?: string, name?: string, pfp?: string, password?: string}} updates
	 * @param {string} password - The current password for verification.
	 * @returns {Promise<boolean|string>} true if success, or error message
	 */
	async editAccount(updates, password) {
		return new Promise(async (resolve) => {
			if (!this.refreshToken) return resolve("Not logged in");
			if (!(await this.checkPassHash(password))) return resolve("Incorrect password!");
			const body = { ...updates };
			if (body.password) {
				const encoder = new TextEncoder();
				const data = encoder.encode(body.password);
				const hashBuffer = await window.crypto.subtle.digest('SHA-512', data);
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				body.password = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
			}
			fetch("[REDACTED]", {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.refreshToken}`
				},
				body: JSON.stringify(body)
			})
				.then(async response => {
					const data = await response.json().catch(() => ({}));
					if (data.rftoken) {
						this.refreshToken = data.rftoken;
						window.sessionStorage.setItem('rftoken', this.refreshToken);
					}
					if (data.error) {
						return resolve(data.error);
					}
					this.name = body.name ?? this.name;
					this.pfp = body.pfp ?? this.pfp;
					this.email = body.email ?? this.email;
					resolve(true);
				})
				.catch(() => resolve("An error occurred while editing the account."));
		});
	}

	/**
	 * Request a password reset email.
	 * @param {string} email
	 * @returns {Promise<{status: number, identifier: string}>}
	 */
	async requestPasswordReset(email) {
		return new Promise(async (resolve) => {
			if (!email || !this.refreshToken) return resolve({ status: 2 });
			fetch("[REDACTED]", {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.refreshToken}`
				},
				body: JSON.stringify({ email })
			})
				.then(async response => {
					const data = await response.json().catch(() => ({}));
					if (data.rftoken) {
						this.refreshToken = data.rftoken;
						window.sessionStorage.setItem('rftoken', this.refreshToken);
					}
					if (data.identifier) this["2fa-identifier"] = data.identifier;
					resolve(data);
				})
				.catch(() => resolve({ status: 2 }));
		});
	}

	/**
	 * Verify a password reset code using the stored 2fa-identifier.
	 * @param {string} code
	 * @returns {Promise<boolean>} true if verified, false otherwise
	 */
	async verifyResetCode(code) {
		return new Promise(async (resolve) => {
			if (!this["2fa-identifier"] || !code || !this.refreshToken) return resolve(false);
			fetch("[REDACTED]", {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.refreshToken}`
				},
				body: JSON.stringify({ identifier: this["2fa-identifier"], code })
			})
				.then(async response => {
					const data = await response.json().catch(() => ({}));
					if (data.rftoken) {
						this.refreshToken = data.rftoken;
						window.sessionStorage.setItem('rftoken', this.refreshToken);
					}
					resolve(!!data.verify);
				})
				.catch(() => resolve(false));
		});
	}
}

const accounts = window.accounts = new AccountManager();

window.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('load', async () => {
		if (!((window.localStorage.getItem('account_email') ?? false) && (window.localStorage.getItem('account_password') ?? false))) {
			var account = {
				"email": "support@[REDACTED]",
				"name": null,
				"pfp": "[REDACTED]"
			}
		} else {
			var account = await accounts.loadAccount(window.localStorage.getItem('account_email'), window.localStorage.getItem('account_password'));
		}
		const navAccButtons = document.querySelectorAll('#acc-nb');
		navAccButtons.forEach(button => {
			if (account.name == null) {
				button.innerHTML = "Log In";
				button.setAttribute('href', '/login');
			}
			else {
				button.innerHTML = "My Account";
				button.setAttribute('href', '/account');
			}
		});
	});
});