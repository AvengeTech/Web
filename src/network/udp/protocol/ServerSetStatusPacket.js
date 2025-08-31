import { PacketIds } from "./PacketIds.js";
import { OneWayPacket } from "./OneWayPacket.js";
import { GameServer } from "../../../server/GameServer.js";

export class ServerSetStatusPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.SERVER_SET_STATUS;

	verifyHandle() {
		const data = this.getPacketData();
		return typeof data.online !== 'undefined';
	}

	handle(handler) {
		const data = this.getPacketData();
		const online = data.online;
		handler.getGameServer().setOnline(online);
	}
}