import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";

export class PlayerSessionSavedPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_SESSION_SAVED;

	verifyHandle() {
		const data = this.getPacketData();
		return data.player && data.server;
	}

	handle(handler) {
		const data = this.getPacketData();
		const server = Network.getInstance().getServer(data.server);
		if (server instanceof GameServer) {
			server.getPacketHandler().queuePacket(this);
		}
	}
}