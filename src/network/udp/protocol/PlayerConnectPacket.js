import { OneWayPacket } from "./OneWayPacket.js";
import { GameServer } from "../../../server/GameServer.js";
import { Network } from "../Network.js";

export class PlayerConnectPacket extends OneWayPacket {
	static PACKET_ID = OneWayPacket.PLAYER_CONNECT;

	verifyHandle() {
		const data = this.getPacketData();
		return data.hasOwnProperty("player");
	}

	handle(handler) {
		const data = this.getPacketData();
		const player = data.player;
		const xuid = data.xuid || 0;

		for (const [_, server] of Object.entries(Network.getInstance().getServers())) {
			const pending = server.getPendingConnection(player);
			if (pending) {
				delete server.pending[player];
				console.log(`${player} had a pending connection on ${server.getIdentifier()} that was overwritten by a new connection!`);
			}
		}

		console.log(`${player} has connected to ${handler.getGameServer().getIdentifier()}`);
		if (xuid !== 0) {
			handler.getGameServer().addPlayer(player, xuid);
		}
	}
}