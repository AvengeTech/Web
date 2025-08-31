import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";

export class PlayerTransferCompletePacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_TRANSFER_COMPLETE;

	verifyHandle() {
		const data = this.getPacketData();
		return data.hasOwnProperty("player");
	}

	handle(handler) {
		const data = this.getPacketData();
		const player = data.player;
		const xuid = data.xuid || 0;
		const server = handler.getGameServer();
		const time = server.completeConnection(player, xuid);

		console.log(`${player} successfully connected to ${server.getIdentifier()} (took ${time} second${time > 1 ? 's' : ''})`);
	}
}