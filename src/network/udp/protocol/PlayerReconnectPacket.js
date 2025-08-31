import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";

export class PlayerReconnectPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_RECONNECT;

	verifyHandle() {
		const data = this.getPacketData();
		return data.hasOwnProperty("player") && data.hasOwnProperty("rfrom") && data.hasOwnProperty("server");
	}

	handle(handler) {
		const data = this.getPacketData();
		const server = Network.getInstance().getServer(data.rfrom);
		if (server !== null) {
			server.getPacketHandler().queuePacket(this);
		}
	}
}