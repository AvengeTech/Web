import { ConnectPacket } from "./ConnectPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";

export class ServerGetPlayersPacket extends ConnectPacket {
	static PACKET_ID = PacketIds.SERVER_GET_PLAYERS;

	verifyHandle() {
		const data = this.getPacketData();
		return data.identifier && Network.SOCKET_PORTS[data.identifier];
	}

	handle(handler) {
		const data = this.getPacketData();
		const identifier = data.identifier;
		const server = Network.getInstance().getServer(identifier);
		const players = [];

		if (server) {
			for (const player of server.getPlayers()) {
				players.push(`${player.getGamertag()}-${player.getXuid()}${player.hasNick() ? `-${player.getNick()}` : ""}`);
			}
			const response = {
				error: false,
				message: `Successfully returned player data of ${identifier}`,
				identifier: identifier,
				players: players
			};
			this.setResponseData(response);
		} else {
			const response = {
				error: true,
				message: "Invalid server identifier provided!"
			};
			this.setResponseData(response);
		}
	}

	verifyResponse() {
		const response = this.getResponseData();
		return response.players && response.identifier;
	}
}