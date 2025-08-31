import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { GameServer } from "../../../server/GameServer.js";
import { Player } from "../../../server/Player.js";
import { Network } from "../Network.js";
export class PlayerMessagePacket extends OneWayPacket {
	static PACKET_ID = PacketIds.PLAYER_MESSAGE;

	verifyHandle() {
		const data = this.getPacketData();
		return data.hasOwnProperty("from") && data.hasOwnProperty("to") && data.hasOwnProperty("message") && data.hasOwnProperty("formatted");
	}

	handle(handler) {
		const data = this.getPacketData();
		const network = Network.getInstance();
		const to = network.getPlayerExact(data.to);

		if (to instanceof Player) {
			this.data.to = to.getGamertag();
			const server = network.getServer(to.getIdentifier());
			server.getPacketHandler().queuePacket(this);

			const response = {
				error: false,
				message: "Successfully sent message to server player was last seen on!",
			};
			this.setResponseData(response);
		} else {
			const response = {
				error: true,
				message: "Player not online!",
			};
			this.setResponseData(response);
		}
	}
}