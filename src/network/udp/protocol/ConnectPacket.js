export class ConnectPacket {
	static PROCESS_TIMEOUT = 10;
	static PACKET_ID = 0;

	static #runtimeId = 0;
	static newRuntimeId() {
		return ++this.#runtimeId;
	}

	runtimeId;
	created;
	sent = false;
	timeoutOffset = 0;
	
	response = {};
	data = {};

	constructor(data = {}, runtimeId = null, created = -1, response = {}) {
		this.data = Object.keys(data).length === 0 ? this.getDefaultPacketData() : data;
		this.runtimeId = runtimeId ?? ConnectPacket.newRuntimeId();
		this.created = created === -1 ? Math.floor(Date.now() / 1000) : created;
		this.response = response;
		this.sent = false;
		this.timeoutOffset = 0;
	}

	getPacketId() {
		return this.constructor.PACKET_ID;
	}

	getRuntimeId() {
		return this.runtimeId;
	}

	getCreated() {
		return this.created;
	}

	hasSent() {
		return this.sent;
	}

	setSent() {
		this.sent = true;
		this.timeoutOffset = Math.floor(Date.now() / 1000) - this.getCreated();
	}

	verifySend() {
		return true;
	}

	send(handler) { }

	sendReturn(handler) { }

	getTimeoutOffset() {
		return this.timeoutOffset;
	}

	toJson(includeResponse = false) {
		const json = {
			packetId: this.getPacketId(),
			runtimeId: this.getRuntimeId(),
			created: this.getCreated(),
			data: this.getPacketData()
		};
		if (includeResponse) json.response = this.getResponseData();
		return JSON.stringify(json);
	}

	getDefaultPacketData() {
		return {};
	}

	getPacketData() {
		return this.data;
	}

	setPacketData(data) {
		this.data = data;
	}

	hasRemotePort() {
		return this.getPacketData().hasOwnProperty('remote_port');
	}

	getRemotePort() {
		return this.getPacketData()['remote_port'] ?? -1;
	}

	getResponseData() {
		return this.response;
	}

	hasResponseData() {
		return Object.keys(this.getResponseData()).length > 0;
	}

	setResponseData(response) {
		this.response = response;
	}

	canTimeout() {
		return Math.floor(Date.now() / 1000) > this.getCreated() + this.getTimeoutOffset() + this.constructor.PROCESS_TIMEOUT;
	}

	timeoutReturn(handler) { }

	timeout(handler) { }

	verifyHandle() {
		return true;
	}

	handle(handler) { }

	verifyResponse() {
		return true;
	}

	handleResponse(handler) { }
}