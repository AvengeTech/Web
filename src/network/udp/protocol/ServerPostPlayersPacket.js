import { ConnectPacket } from "./ConnectPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";

export class ServerPostPlayersPacket extends ConnectPacket {
	static PACKET_ID = PacketIds.SERVER_POST_PLAYERS;

	send(handler) {
		console.log("Server alive ping successfully sent to " + handler.getGameServer().getIdentifier());
	}

	handle(handler) {
		const data = this.getPacketData();
		const server = handler.getGameServer();
		server.setPlayers(data.players || []);
		const response = {
			error: false,
			message: "Updated player data for " + server.getIdentifier() + " (" + (data.players ? data.players.length : 0) + " players)"
		};
		this.setResponseData(response);
	}

	verifyResponse() {
		const response = this.getResponseData();
		return response.players !== undefined;
	}
}