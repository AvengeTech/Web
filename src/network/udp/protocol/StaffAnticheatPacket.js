import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class StaffAnticheatPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.STAFF_ANTICHEAT_NOTICE;

	verifyHandle() {
		const data = this.getPacketData();
		return data.hasOwnProperty("message");
	}

	handle(handler) {
		const data = this.getPacketData();
		Network.getInstance().anticheatAlert(data.message, handler.getGameServer().getIdentifier());
	}
}