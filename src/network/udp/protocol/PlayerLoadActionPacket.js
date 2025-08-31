import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class PlayerLoadActionPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_LOAD_ACTION;

	verifyHandle() {
		const data = this.getPacketData();
		return data.player !== undefined && data.server !== undefined && data.action !== undefined;
	}

	handle(handler) {
		const data = this.getPacketData();
		const server = Network.getInstance().getServer(data.server);
		if (server instanceof GameServer) {
			server.getPacketHandler().queuePacket(this);
		}
	}
}