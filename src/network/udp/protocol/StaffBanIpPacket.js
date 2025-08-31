import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";

export class StaffBanIpPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.STAFF_BAN_IP;

	verifyHandle() {
		const data = this.getPacketData();
		return data.hasOwnProperty('ip') && data.hasOwnProperty('by') && data.hasOwnProperty('length') && data.hasOwnProperty('reason');
	}

	handle(handler) {
		const identifier = this.data.identifier = handler.getGameServer().getIdentifier();
		const servers = Network.getInstance().getServers();
		for (const server of servers) {
			if (server.getIdentifier() !== identifier) {
				server.getPacketHandler().queuePacket(this);
			}
		}
	}
}