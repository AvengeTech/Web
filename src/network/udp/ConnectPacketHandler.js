import { GameServer } from "../../server/GameServer.js";
import { ConnectPacket } from "./protocol/ConnectPacket.js";
import { PacketIds } from "./protocol/PacketIds.js";
import { UdpConnector } from "./UdpConnector.js";
import { OneWayPacket } from "./protocol/OneWayPacket.js";
import { ServerAlivePacket } from "./protocol/ServerAlivePacket.js";
import { DataSyncPacket } from "./protocol/DataSyncPacket.js";
import { PlayerChatPacket } from "./protocol/PlayerChatPacket.js";
import { PlayerConnectPacket } from "./protocol/PlayerConnectPacket.js";
import { PlayerDataTransferPacket } from "./protocol/PlayerDataTransferPacket.js";
import { PlayerDisconnectPacket } from "./protocol/PlayerDisconnectPacket.js";
import { PlayerLoadActionPacket } from "./protocol/PlayerLoadActionPacket.js";
import { PlayerMessagePacket } from "./protocol/PlayerMessagePacket.js";
import { PlayerReconnectPacket } from "./protocol/PlayerReconnectPacket.js";
import { PlayerSessionSavedPacket } from "./protocol/PlayerSessionSavedPacket.js";
import { PlayerSummonPacket } from "./protocol/PlayerSummonPacket.js";
import { PlayerTransferCompletePacket } from "./protocol/PlayerTransferCompletePacket.js";
import { PlayerTransferPacket } from "./protocol/PlayerTransferPacket.js";
import { ServerAnnouncementPacket } from "./protocol/ServerAnnouncementPacket.js";
import { ServerGetAllPlayersPacket } from "./protocol/ServerGetAllPlayersPacket.js";
import { ServerGetPlayersPacket } from "./protocol/ServerGetPlayersPacket.js";
import { ServerGetStatusPacket } from "./protocol/ServerGetStatusPacket.js";
import { ServerPostPlayersPacket } from "./protocol/ServerPostPlayersPacket.js";
import { ServerSetStatusPacket } from "./protocol/ServerSetStatusPacket.js";
import { ServerSubUpdatePacket } from "./protocol/ServerSubUpdatePacket.js";
import { ServerWhitelistPacket } from "./protocol/ServerWhitelistPacket.js";
import { StaffAnticheatPacket } from "./protocol/StaffAnticheatPacket.js";
import { StaffBanDevicePacket } from "./protocol/StaffBanDevicePacket.js";
import { StaffBanIpPacket } from "./protocol/StaffBanIpPacket.js";
import { StaffBanPacket } from "./protocol/StaffBanPacket.js";
import { StaffChatPacket } from "./protocol/StaffChatPacket.js";
import { StaffCommandSeePacket } from "./protocol/StaffCommandSeePacket.js";
import { StaffMutePacket } from "./protocol/StaffMutePacket.js";
import { StaffWarnPacket } from "./protocol/StaffWarnPacket.js";


export class ConnectPacketHandler {
	/** @type {Object<number, ConnectPacket>} */
	static registeredPackets = {};

	/**
	 * @type {UdpConnector}
	 */
	connector;

	/** @type {Object<number, ConnectPacket>} */
	waitingPackets = {};
	/** @type {Object<number, ConnectPacket>} */
	returningPackets = {};

	constructor() {
		this.registerPackets();

		this.connector = new UdpConnector('web', 0, 0);
	}

	registerPackets() {
		ConnectPacketHandler.registerPacket(PacketIds.SERVER_ALIVE, ServerAlivePacket);
		ConnectPacketHandler.registerPacket(PacketIds.DATA_SYNC, DataSyncPacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_CHAT, PlayerChatPacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_CONNECT, PlayerConnectPacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_DATA_TRANSFER, PlayerDataTransferPacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_DISCONNECT, PlayerDisconnectPacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_LOAD_ACTION, PlayerLoadActionPacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_MESSAGE, PlayerMessagePacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_RECONNECT, PlayerReconnectPacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_SESSION_SAVED, PlayerSessionSavedPacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_SUMMON, PlayerSummonPacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_TRANSFER_COMPLETE, PlayerTransferCompletePacket);
		ConnectPacketHandler.registerPacket(PacketIds.PLAYER_TRANSFER, PlayerTransferPacket);
		ConnectPacketHandler.registerPacket(PacketIds.SERVER_ANNOUNCEMENT, ServerAnnouncementPacket);
		ConnectPacketHandler.registerPacket(PacketIds.SERVER_GET_ALL_PLAYERS, ServerGetAllPlayersPacket);
		ConnectPacketHandler.registerPacket(PacketIds.SERVER_GET_PLAYERS, ServerGetPlayersPacket);
		ConnectPacketHandler.registerPacket(PacketIds.SERVER_GET_STATUS, ServerGetStatusPacket);
		ConnectPacketHandler.registerPacket(PacketIds.SERVER_POST_PLAYERS, ServerPostPlayersPacket);
		ConnectPacketHandler.registerPacket(PacketIds.SERVER_SET_STATUS, ServerSetStatusPacket);
		ConnectPacketHandler.registerPacket(PacketIds.SERVER_SUB_UPDATE, ServerSubUpdatePacket);
		ConnectPacketHandler.registerPacket(PacketIds.SERVER_WHITELIST, ServerWhitelistPacket);
		ConnectPacketHandler.registerPacket(PacketIds.STAFF_ANTICHEAT_NOTICE, StaffAnticheatPacket);
		ConnectPacketHandler.registerPacket(PacketIds.STAFF_BAN_DEVICE, StaffBanDevicePacket);
		ConnectPacketHandler.registerPacket(PacketIds.STAFF_BAN_IP, StaffBanIpPacket);
		ConnectPacketHandler.registerPacket(PacketIds.STAFF_BAN, StaffBanPacket);
		ConnectPacketHandler.registerPacket(PacketIds.STAFF_CHAT, StaffChatPacket);
		ConnectPacketHandler.registerPacket(PacketIds.STAFF_COMMAND_SEE, StaffCommandSeePacket);
		ConnectPacketHandler.registerPacket(PacketIds.STAFF_MUTE, StaffMutePacket);
		ConnectPacketHandler.registerPacket(PacketIds.STAFF_WARN, StaffWarnPacket);
	}

	static registerPacket(packetId, packetClass) {
		if (ConnectPacketHandler.registeredPackets[packetId]) {
			throw new Error(`Packet ID ${packetId} is already registered.`);
		}
		ConnectPacketHandler.registeredPackets[packetId] = packetClass;
	}

	/**
	 * @param {number} packetId
	 * @returns {?ConnectPacket}
	 */
	static getPacketClass(packetId) {
		if (ConnectPacketHandler.registeredPackets[packetId]) {
			return ConnectPacketHandler.registeredPackets[packetId];
		}
		return null;
	}

	/**
	 * @param {Object} data
	 * @returns {?ConnectPacket}
	 */
	getPacketFromData(data) {
		if (!data.packetId) {
			return null;
		}
		const packetClass = ConnectPacketHandler.getPacketClass(data.packetId);
		if (!packetClass) {
			console.warn(`No packet class found for packet ID ${data.packetId}`);
			return null;
		}
		return new (packetClass)(data.data ?? {}, data.runtimeId ?? -1, data.created ?? -1, data.response ?? {});
	}

	/**
	 * @returns {GameServer}
	 */
	getGameServer() {
		return this.server;
	}

	/**
	 * @returns {UdpConnector}
	 */
	getUdpConnector() {
		return this.connector;
	}

	close() {
		if (this.connector !== null) {
			this.connector.needReconnect = false;
			this.connector.alive = false;
			this.connector.shutdown = true;
		}
	}

	tick() {
		const thread = this.getUdpConnector();

		for (const runtimeId of thread.processedPackets) {
			const packet = this.getWaitingPacket(runtimeId);
			if (packet instanceof ConnectPacket) {
				packet.setSent();
				packet.send(this);
				const packetName = packet.constructor.name;
				Server.getInstance().log(
					`${packetName} with runtime ID ${Color.CYAN(runtimeId)} has been sent to ${Color.YELLOW(this.getGameServer().getIdentifier())}`,
					Server.LOG_DEBUG,
					3
				);
			}
		}
		thread.processedPackets.length = 0; // Clear the array

		for (const [runtimeId, data] of Object.entries(thread.responsePackets)) {
			const packet = this.getWaitingPacket(runtimeId);
			if (packet instanceof ConnectPacket) {
				packet.setResponseData(data.response ?? []);
				if (packet.verifyResponse()) {
					packet.handleResponse(this);
					const packetName = packet.constructor.name;
					Server.getInstance().log(
						`Sent ${packetName} with runtime ID ${Color.CYAN(runtimeId)} has received response from ${Color.YELLOW(this.getGameServer().getIdentifier())}`,
						Server.LOG_DEBUG,
						3
					);
				} else {
					Server.getInstance().log(`Could not verify response given`, Server.LOG_DEBUG, 3);
				}
				delete this.waitingPackets[runtimeId];
			} else {
				Server.getInstance().log(
					`Couldn't send packet with runtime ID ${Color.CYAN(runtimeId)} to ${Color.YELLOW(this.getGameServer().getIdentifier())}`,
					Server.LOG_DEBUG,
					3
				);
			}
		}
		thread.responsePackets = {};

		for (const [runtimeId, packet] of Object.entries(this.waitingPackets)) {
			if (packet.canTimeout()) {
				packet.timeout(this);
				delete this.waitingPackets[runtimeId];
				const packetName = packet.constructor.name;
				Server.getInstance().log(
					`Sent ${packetName} with runtime ID ${Color.CYAN(runtimeId)} has timed out`,
					Server.LOG_DEBUG,
					3
				);
			}
		}

		for (const [runtimeId, data] of Object.entries(thread.receivedPackets)) {
			const packet = this.getPacketFromData(data);
			if (packet instanceof ConnectPacket) {
				if (packet.verifyHandle()) {
					packet.handle(this);
					const shouldRespond = !(packet instanceof OneWayPacket);
					if (shouldRespond) {
						thread.returningPackets.push(packet.toJson(true));
						packet.created = Date.now(); // Reset timeout
						this.returningPackets[runtimeId] = packet;
					}
					const packetName = packet.constructor.name;
					Server.getInstance().log(
						`Received ${packetName} with runtime ID ${Color.CYAN(runtimeId)} from ${Color.YELLOW(this.getGameServer().getIdentifier())}! ` +
						(shouldRespond ? "sending response back..." : ""),
						Server.LOG_DEBUG,
						3
					);
				} else {
					Server.getInstance().log(
						`Couldn't verify data for received packet with runtime ID ${Color.CYAN(runtimeId)}`,
						Server.LOG_DEBUG,
						3
					);
				}
			} else {
				Server.getInstance().log(
					`Invalid packet ID for received packet with runtime ID ${Color.CYAN(runtimeId)}`,
					Server.LOG_DEBUG,
					3
				);
			}
		}
		thread.receivedPackets = {};

		for (const runtimeId of thread.returnedPackets) {
			const packet = this.getReturningPacket(runtimeId);
			if (packet instanceof ConnectPacket) {
				packet.sendReturn(this);
				delete this.returningPackets[runtimeId];
				const packetName = packet.constructor.name;
				Server.getInstance().log(
					`Returned ${Color.LIGHT_GRAY(packetName)} with runtime ID ${Color.CYAN(runtimeId)} to ${Color.YELLOW(this.getGameServer().getIdentifier())}`,
					Server.LOG_DEBUG,
					3
				);
			} else {
				Server.getInstance().log(
					`Invalid packet runtime ID for returned packet: ${Color.CYAN(runtimeId)}`,
					Server.LOG_DEBUG,
					3
				);
			}
		}
		thread.returnedPackets.length = 0;

		for (const [runtimeId, packet] of Object.entries(this.returningPackets)) {
			if (packet.canTimeout()) {
				packet.timeoutReturn(this);
				delete this.returningPackets[runtimeId];
				const packetName = packet.constructor.name;
				Server.getInstance().log(
					`Received ${Color.LIGHT_GRAY(packetName)} with runtime ID ${Color.CYAN(runtimeId)} has timed out returning to ${Color.YELLOW(this.getGameServer().getIdentifier())}`,
					Server.LOG_DEBUG,
					3
				);
			}
		}
	}

	/**
	 * @returns {Object<number, ConnectPacket>}
	 */
	getWaitingPackets() {
		return this.waitingPackets;
	}

	/**
	 * @param {number} runtimeId
	 * @returns {?ConnectPacket}
	 */
	getWaitingPacket(runtimeId) {
		return this.waitingPackets[runtimeId] ?? null;
	}

	/**
	 * @param {number} runtimeId
	 * @returns {?ConnectPacket}
	 */
	getReturningPacket(runtimeId) {
		return this.returningPackets[runtimeId] ?? null;
	}

	/**
	 * @param {ConnectPacket} packet
	 * @returns {boolean}
	 */
	queuePacket(packet) {
		if (packet.verifySend()) {
			if (!packet.hasResponseData() && !(packet instanceof OneWayPacket)) {
				this.waitingPackets[packet.getRuntimeId()] = packet;
			}
			this.getUdpConnector().pendingPackets.push(packet.toJson(packet.hasResponseData()));
			return true;
		}
		return false;
	}


}