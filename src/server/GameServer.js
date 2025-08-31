import { Player } from "./Player.js";
import { PendingConnection } from "./PendingConnection.js";
import { ConnectPacketHandler } from "../network/udp/ConnectPacketHandler.js";
import { Network } from "../network/udp/Network.js";

export class GameServer {
	/**
	 * @type {string}
	 */
	identifier;

	online = true;
	whitelisted = "";
	whitelist = [];

	/** @type {Object<string, Player>} */
	players = {};
	/** @type {Object<string, PendingConnection>} */
	pending = [];

	constructor(identifier) {
		this.identifier = identifier;
	}

	tick(currentTick) {
		// idk yet
	}

	/**
	 * @returns {Network}
	 */
	getNetwork() {
		return Network.getInstance();
	}

	/**
	 * @returns {ConnectPacketHandler}
	 */
	getPacketHandler() {
		return this.getNetwork().getPacketHandler();
	}

	close() {
		this.online = false;
		this.packetHandler.close();
		this.players.forEach(player => player.close());
		this.players = [];
		this.pending = [];
	}

	/**
	 * @returns {string}
	 */
	getIdentifier() {
		return this.identifier;
	}

	/**
	 * @returns {boolean}
	 */
	isOnline() {
		return this.online;
	}

	/**
	 * @param {boolean} online 
	 * @param {boolean} send 
	 */
	setOnline(online = true, send = true) {
		this.online = online;

		if (send) {
			var pk = new ServerSetStatusPacket({
				identifier: this.identifier,
				online: this.online
			});
			for (const [identifier, server] of Object.entries(this.getNetwork().getServers())) {
				if (server.isOnline() && identifier !== this.identifier) {
					server.getPacketHandler().queuePacket(pk);
				}
			}
		}
	}

	/**
	 * @returns {boolean}
	 */
	isWhitelisted() {
		return this.whitelisted != "";
	}

	/**
	 * @returns {string[]}
	 */
	getWhitelist() {
		return this.whitelist;
	}

	/**
	 * @param {int} xuid 
	 * @returns {boolean}
	 */
	onWhitelist(xuid) {
		return this.whitelist.includes(xuid);
	}

	/**
	 * @param {string} whitelisted 
	 * @param {string[]} whitelist 
	 * @param {boolean} send 
	 */
	setWhitelistStatus(whitelisted = "default", whitelist = [], send = true) {
		this.whitelisted = whitelisted;
		this.whitelist = whitelist;

		if (send) {
			var pk = new ServerSetWhitelistPacket({
				identifier: this.identifier,
				whitelisted: this.whitelisted,
				whitelist: this.whitelist
			});
			for (const [identifier, server] of Object.entries(this.getNetwork().getServers())) {
				if (server.isOnline() && identifier !== this.identifier) {
					server.getPacketHandler().queuePacket(pk);
				}
			}
		}
	}

	/**
	 * @returns {Object<string, Player>}
	 */
	getPlayers() {
		return this.players;
	}

	/**
	 * @param {string} name 
	 * @returns {Player|null}
	 */
	getPlayer(name) {
		return this.players.find(player => player.name.toLowerCase() === name.toLowerCase());
	}

	/**
	 * @param {number} xuid 
	 * @returns {Player|null}
	 */
	getPlayerByXuid(xuid) {
		return this.players.find(player => player.xuid === xuid);
	}

	/**
	 * @param {string} gamertag 
	 * @param {number} xuid
	 */
	addPlayer(gamertag, xuid) {
		if (this.getPlayer(gamertag) !== null) return;
		const player = new Player(gamertag, xuid, this);
		this.players[gamertag.toLowerCase()] = player;
	}

	removePlayer(gamertag) {
		if (this.getPlayer(gamertag) === null) return;
		delete this.players[gamertag.toLowerCase()];
	}

	getPlayersString() {
		let string = "";
		for (const [_, player] of Object.entries(this.players)) {
			string += player.getName() + ",";
		}
		return string.trim(",");
	}

	setPlayers(players) {
		this.players = {};
		for (const [_, player] of Object.entries(players)) {
			data = player.split("-");
			if (!data[1]) data[1] = 0;
			if (!data[2]) data[2] = null;
			this.players[data[0].toLowerCase()] = new Player(data[0], parseInt(data[1]), this.getIdentifier(), data[2]);
		}
		console.log(`Player update recieved from ${this.getIdentifier()}! (${Object.keys(this.players).length} total)`);
	}

	/**
	 * @returns {Object<string, Player>}
	 */
	getPendingConnections() {
		return this.pending;
	}

	addPendingConnection(gamertag) {
		this.pending[gamertag.toLowerCase()] = new PendingConnection(this, gamertag);
	}

	getPendingConnection(gamertag) {
		return this.pending[gamertag.toLowerCase()] ?? null;
	}

	completeConnection(gamertag, xuid) {
		if (this.getPendingConnection(gamertag) === null) return;
		var connection = this.getPendingConnection(gamertag);
		if (connection instanceof PendingConnection) {
			connection.complete();
			delete this.pending[gamertag.toLowerCase()];
			this.addPlayer(gamertag, xuid);
			return Math.floor(Date.now() / 1000) - connection.getCreated();
		}
		return -1;
	}
}