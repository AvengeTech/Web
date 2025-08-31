import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";
import { Network } from "../Network.js";

export class ServerAnnouncementPacket extends OneWayPacket {
    static PACKET_ID = PacketIds.SERVER_ANNOUNCEMENT;

    verifyHandle() {
        return this.getPacketData().hasOwnProperty("message");
    }

    handle(handler) {
        const message = this.getPacketData().message;
        Network.getInstance().announce(message);
    }
}