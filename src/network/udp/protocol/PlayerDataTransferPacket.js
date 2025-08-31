import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { ConnectPacketHandler } from "../ConnectPacketHandler.js";
import { GameServer } from "../../../server/GameServer.js";

export class PlayerDataTransferPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_DATA_TRANSFER;

	verifyHandle() {
		const data = this.getPacketData();
		return data.from !== undefined && data.to !== undefined;
	}

	handle(handler) {
		const servers = Network.getInstance().getServers();
		for (const server of servers) {
			server.getPacketHandler().queuePacket(this);
		}
	}
}