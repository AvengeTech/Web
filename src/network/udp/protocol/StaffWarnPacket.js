import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class StaffWarnPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.STAFF_WARN;

	verifyHandle() {
		const data = this.getPacketData();
		return data.player !== undefined && data.by !== undefined && data.reason !== undefined;
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