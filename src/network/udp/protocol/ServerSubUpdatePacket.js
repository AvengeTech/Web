import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
export class ServerSubUpdatePacket extends OneWayPacket {
	static PACKET_ID = PacketIds.SERVER_SUB_UPDATE;

	verifyHandle() {
		const data = this.getPacketData();
		return data.server && data.type;
	}

	handle(handler) {
		const data = this.getPacketData();
		const server = data.server;
		this.data.server = handler.getGameServer().getIdentifier();

		if (typeof server !== 'string') {
			for (const serv of server) {
				const gserver = Network.getInstance().getServer(serv);
				if (gserver instanceof GameServer) {
					gserver.getPacketHandler().queuePacket(this);
				}
			}
		} else {
			const gserver = Network.getInstance().getServer(server);
			if (gserver instanceof GameServer) {
				gserver.getPacketHandler().queuePacket(this);
			}
		}
	}
}