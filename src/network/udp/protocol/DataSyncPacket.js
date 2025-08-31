import { OneWayPacket } from "./OneWayPacket.js";
import { PacketIds } from "./PacketIds.js";

class DataSyncPacket extends OneWayPacket {
    static PACKET_ID = PacketIds.DATA_SYNC;

    verifyHandle() {
        return true;
    }

    handle(handler) {
        // NOOP
    }
}

export { DataSyncPacket };