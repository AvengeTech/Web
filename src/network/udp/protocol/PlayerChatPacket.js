import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
import { Network } from "../Network.js";

export class PlayerChatPacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_CHAT;

	verifyHandle() {
		const data = this.getPacketData();
		return data.player !== undefined && data.message !== undefined && data.server !== undefined && data.formatted !== undefined;
	}

	handle(handler) {
		const data = this.getPacketData();
		if (!data.sendto) {
			for (const server of Network.getInstance().getServers()) {
				if (server.getIdentifier() !== data.server) {
					server.getPacketHandler().queuePacket(this);
				}
			}
		} else {
			for (const server of Network.getInstance().getServers()) {
				if (Array.isArray(data.sendto) && data.sendto.includes(server.getIdentifier())) {
					server.getPacketHandler().queuePacket(this);
				}
			}
		}
	}
}