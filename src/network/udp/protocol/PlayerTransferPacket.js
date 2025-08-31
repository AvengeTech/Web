import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class PlayerTransferPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_TRANSFER;

	verifyHandle() {
		const data = this.getPacketData();
		return data.player && data.to && data.message;
	}

	handle(handler) {
		const data = this.getPacketData();
		const player = data.player;
		const to = data.to;
		const message = data.message;
		const server = Network.getInstance().getServer(to);

		if (server instanceof GameServer) {
			server.getPacketHandler().queuePacket(new PlayerTransferPacket({
				player: player,
				from: handler.getGameServer().getIdentifier(),
				message: message
			}));
			server.addPendingConnection(player);

			Server.getInstance().log(`Pending connection on ${server.getIdentifier()} created for ${player}`, Server.LOG_DEBUG, 1);
		}
		handler.getGameServer().removePlayer(player);
	}
}