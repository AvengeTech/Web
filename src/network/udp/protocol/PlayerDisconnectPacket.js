import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class PlayerDisconnectPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_DISCONNECT;

	verifyHandle() {
		const data = this.getPacketData();
		return data.player !== undefined;
	}

	handle(handler) {
		const player = this.getPacketData().player;
		console.log(`${player} has disconnected from ${handler.getGameServer().getIdentifier()}`);
		handler.getGameServer().removePlayer(player);
	}
}