import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class StaffChatPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.STAFF_CHAT;

	verifyHandle() {
		const data = this.getPacketData();
		return data.hasOwnProperty("sender") && data.hasOwnProperty("message");
	}

	handle(handler) {
		const data = this.getPacketData();
		Network.getInstance().staffChat(data.sender, handler.getGameServer().getIdentifier(), data.message);
	}
}