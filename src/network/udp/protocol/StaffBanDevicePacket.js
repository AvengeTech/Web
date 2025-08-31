import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";

export class StaffBanDevicePacket extends OneWayPacket {
	static PACKET_ID = PacketIds.STAFF_BAN_DEVICE;

	verifyHandle() {
		const data = this.getPacketData();
		return data.hasOwnProperty("did") && data.hasOwnProperty("by") && data.hasOwnProperty("length") && data.hasOwnProperty("reason");
	}

	handle(handler) {
		const data = this.getPacketData();
		const identifier = this.data.identifier = handler.getGameServer().getIdentifier();
		const servers = Network.getInstance().getServers();

		for (const server of servers) {
			if (server.getIdentifier() !== identifier) {
				server.getPacketHandler().queuePacket(this);
			}
		}
	}
}