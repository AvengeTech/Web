import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class PlayerSummonPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_SUMMON;

	verifyHandle() {
		const data = this.getPacketData();
		return data.player && data.sentby;
	}

	handle(handler) {
		const data = this.getPacketData();
		const player = Network.getInstance().getPlayerExact(data.player);
		if (player) {
			const sentby = data.sentby;
			const server = Network.getInstance().getServer(player.getIdentifier());
			server.getPacketHandler().queuePacket(new PlayerSummonPacket({
				player: player.getGamertag(),
				sentby: sentby,
				to: handler.getGameServer().getIdentifier()
			}));

			console.log(`Player ${player.getGamertag()} summoned to ${handler.getGameServer().getIdentifier()} from ${server.getIdentifier()}`);
		}
	}
}