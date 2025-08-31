import { ConnectPacket } from "./ConnectPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class ServerAlivePacket extends ConnectPacket {
	static PACKET_ID = PacketIds.SERVER_ALIVE;

	send(handler) {
		console.log(`Alive ping successfully sent to ${handler.getGameServer().getIdentifier()}! Waiting for response...`);
	}

	timeout(handler) {
		console.log(`Server ${handler.getGameServer().getIdentifier()} was not alive... rip`);
	}

	handleResponse(handler) {
		console.log(`Server ${handler.getGameServer().getIdentifier()} is alive! Response message: ${this.getResponseData().message ?? "none"}`);
	}
}