import { ConnectPacket } from "./ConnectPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class ServerGetStatusPacket extends ConnectPacket {
	static PACKET_ID = PacketIds.SERVER_GET_STATUS;

	verifyHandle() {
		const data = this.getPacketData();
		return data.identifier !== undefined;
	}

	handle(handler) {
		const data = this.getPacketData();
		const identifier = data.identifier;
		const statuses = {};

		if (Array.isArray(identifier)) {
			for (const id of identifier) {
				const server = Network.getInstance().getServer(id);
				if (server instanceof GameServer) {
					statuses[id] = server.isOnline();
				}
			}
		} else {
			const server = Network.getInstance().getServer(identifier);
			if (server instanceof GameServer) {
				statuses[identifier] = server.isOnline();
			}
		}

		this.setResponseData({
			error: false,
			message: "Server statuses returned!",
			statuses: statuses
		});
	}

	verifyResponse() {
		const response = this.getResponseData();
		return response.online !== undefined;
	}

	handleResponse(handler) {
		const response = this.getResponseData();
		handler.getGameServer().setOnline(response.online ?? false);
		Server.getInstance().log(`Status update received from ${handler.getGameServer().getIdentifier()}: ${response.online ? "ONLINE" : "OFFLINE"}`, Server.LOG_DEBUG, 2);
	}
}