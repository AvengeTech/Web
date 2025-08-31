import { ConnectPacket } from "./ConnectPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class ServerGetAllPlayersPacket extends ConnectPacket {
	static PACKET_ID = PacketIds.SERVER_GET_ALL_PLAYERS;

	verifyHandle() {
		const data = this.getPacketData();
		return true; // No specific data required for this packet
	}

	handle(handler) {
		const players = {};
		for (const server of Network.getInstance().getServers()) {
			players[server.getIdentifier()] = [];
			for (const player of server.getPlayers()) {
				players[server.getIdentifier()].push(`${player.getGamertag()}-${player.getXuid()}${player.hasNick() ? `-${player.getNick()}` : ''}`);
			}
		}
		const response = {
			error: false,
			message: `Successfully returned player data of all servers`,
			players: players
		};
		this.setResponseData(response);
	}

	verifyResponse() {
		const response = this.getResponseData();
		return response && response.players !== undefined;
	}
}