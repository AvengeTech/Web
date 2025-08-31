import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";

export class StaffBanPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.STAFF_BAN;

	verifyHandle() {
		const data = this.getPacketData();
		return data.player && data.by && data.length && data.reason;
	}

	handle(handler) {
		const identifier = this.data.identifier = handler.getGameServer().getIdentifier();
		for (const server of Network.getInstance().getServers()) {
			if (server.getIdentifier() !== identifier) {
				server.getPacketHandler().queuePacket(this);
			}
		}
	}
}