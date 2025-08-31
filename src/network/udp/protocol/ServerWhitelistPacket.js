import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";

export class ServerWhitelistPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.SERVER_WHITELIST;

	verifyHandle() {
		const data = this.getPacketData();
		return data.whitelisted !== undefined && data.whitelist !== undefined;
	}

	handle(handler) {
		const data = this.getPacketData();
		const { whitelisted, whitelist } = data;
		handler.getGameServer().setWhitelistStatus(whitelisted, whitelist);
	}
}