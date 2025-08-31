import { GameServer } from './GameServer.js';

export class PendingConnection {
	static TIMEOUT = 90;

	/** @type {number} */
	created;

	/** @type {GameServer} */
	server;
	/** @type {string} */
	gamertag;

	/**
	 * @param {GameServer} server
	 * @param {string} gamertag
	 */
	constructor(server, gamertag) {
		this.created = Math.floor(Date.now() / 1000);
		this.server = server;
		this.gamertag = gamertag;
	}

	getGameServer() {
		return this.server;
	}

	getGamertag() {
		return this.gamertag;
	}

	getCreated() {
		return this.created;
	}

	canTimeout() {
		return (Math.floor(Date.now() / 1000) - this.created) >= PendingConnection.TIMEOUT;
	}
	
	timeout() {
		console.log(`Pending connection to ${this.server.getIdentifier()} for ${this.gamertag} timed out!`);
	}

	complete() {}
}