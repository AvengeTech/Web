import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class StaffCommandSeePacket extends OneWayPacket {
	static PACKET_ID = PacketIds.STAFF_COMMAND_SEE;

	verifyHandle() {
		const data = this.getPacketData();
		return data.sender !== undefined && data.command !== undefined;
	}

	handle(handler) {
		const data = this.getPacketData();
		Network.getInstance().commandSee(data.sender, handler.getGameServer().getIdentifier(), data.command);
	}
}