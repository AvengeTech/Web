import { GameServer } from "../../server/GameServer.js";
import { Player } from "../../server/Player.js";
import { ConnectPacketHandler } from "./ConnectPacketHandler.js";
import { UdpConnector } from "./UdpConnector.js";

export class Network {

	static SOCKET_PORTS = {
		"lobby-1": [0, 0],
		"lobby-2": [0, 0],
		"lobby-3": [0, 0],
		"lobby-test": [0, 0],

		"prison-1": [0, 0],
		"prison-1-pvp": [0, 0],
		"prison-1-plots": [0, 0],
		"prison-test-cells": [0, 0],

		"prison-event": [0, 0],

		"prison-test": [0, 0],
		"prison-test-pvp": [0, 0],
		"prison-test-plots": [0, 0],
		"prison-test-cells": [0, 0],

		"skyblock-1": [0, 0],
		"skyblock-1-pvp": [0, 0],
		"skyblock-1-is1": [0, 0],
		"skyblock-1-is2": [0, 0],
		"skyblock-1-is3": [0, 0],

		"skyblock-1archive": [0, 0],
		"skyblock-2archive": [0, 0],

		"skyblock-test": [0, 0],
		"skyblock-test-pvp": [0, 0],
		"skyblock-test-is1": [0, 0],

		"pvp-1": [0, 0],
		"pvp-test": [0, 0],

		"build-test": [0, 0],

		"creative-test": [0, 0],
		"creative-test-w1": [0, 0],

		"idle-1": [0, 0],
	};

	static #instance = null;

	/**
	 * @type {Object<string, GameServer>}
	 */
	servers = {};
	/** @type {ConnectPacketHandler} */
	packetHandler;

	constructor() {
		Network.#instance = this;

		for (const identifier in Network.SOCKET_PORTS) {
			this.servers[identifier] = new GameServer(identifier);
		}
		this.packetHandler = new ConnectPacketHandler();
	}

	/**
	 * @returns {?Network}
	 */
	static getInstance() {
		return this.#instance;
	}

	tick(currentTick) {
		this.packetHandler.tick(currentTick);
	}

	/**
	 * @returns {ConnectPacketHandler}
	 */
	getPacketHandler() {
		return this.packetHandler;
	}

	close() {
		console.log("Shutting down network threads...");
		for (const [_, server] of Object.entries(this.servers)) {
			server.close();
		}
	}

	getServer(identifier) {
		if (identifier in this.servers) {
			return this.servers[identifier];
		}
		return null;
	}

	getServers() {
		return this.servers;
	}

	getPlayer(name) {
		for (const [_, server] of Object.entries(this.servers)) {
			const player = server.getPlayer(name);
			if (player) {
				return player;
			}
		}
		return null;
	}

	getPlayerByXuid(xuid) {
		for (const [_, server] of Object.entries(this.servers)) {
			const player = server.getPlayerByXuid(xuid);
			if (player) {
				return player;
			}
		}
		return null;
	}

	getPlayerCount() {
		let count = 0;
		for (const [_, server] of Object.entries(this.servers)) {
			count += server.getPlayerCount();
		}
		return count;
	}

	allPlayersString() {
		let string = "";
		for (const [_, server] of Object.entries(this.servers)) {
			string += server.getIdentifier() + ":";
			for (const [_, player] of Object.entries(server.getPlayers())) {
				string += player.getName() + "-" + player.getXuid() + ",";
			}
			string = string.trim(",") + ";";
		}
		return string.trim(";");
	}

	announce(message) {
		for (const [_, server] of Object.entries(this.servers)) {
			server.getPacketHandler().queuePacket(new ServerAnnouncementPacket({ message }));
		}
	}

}