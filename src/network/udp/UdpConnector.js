import dgram from 'dgram';

export class UdpConnector {
	static NAME = "WEB-UNITED";
	static SOCKET_ADDRESS = "127.0.0.1";

	constructor(identifier, hostPort, clientPort) {
		this.identifier = identifier;
		this.hostPort = hostPort;
		this.clientPort = clientPort;

		this.pendingPackets = [];
		this.processedPackets = [];
		this.responsePackets = {};

		this.receivedPackets = {};
		this.returningPackets = [];
		this.returnedPackets = [];

		this.needReconnect = false;
		this.alive = true;
		this.shutdown = false;

		this.setupSockets();
		this.run();
	}

	log(msg, isError = false) {
		console[isError ? 'error' : 'log'](`[${this.identifier}] ${msg}`);
	}

	setupSockets() {
		try {
			this.clientSocket = dgram.createSocket('udp4');
			this.hostSocket = dgram.createSocket('udp4');

			// Bind hostSocket to hostPort (swapped logic)
			this.hostSocket.bind(this.hostPort, UdpConnector.SOCKET_ADDRESS, () => {
				this.log(`Bound ${UdpConnector.NAME} host UDP socket`);
			});

			this.clientSocket.on('message', (msg, rinfo) => {
				try {
					const data = JSON.parse(msg.toString());
					if (data?.runtimeId !== undefined) {
						this.responsePackets[data.runtimeId] = data;
					}
				} catch { }
			});

			this.hostSocket.on('message', (msg, rinfo) => {
				try {
					const data = JSON.parse(msg.toString());
					if (data?.runtimeId !== undefined) {
						data.data = data.data || {};
						data.data.remote_port = rinfo.port;
						this.receivedPackets[data.runtimeId] = data;
					}
				} catch { }
			});

			this.clientSocket.on('error', (err) => {
				this.log(`Client socket error: ${err.message}`, true);
				this.alive = false;
				this.needReconnect = true;
			});

			this.hostSocket.on('error', (err) => {
				this.log(`Host socket error: ${err.message}`, true);
				this.alive = false;
				this.needReconnect = true;
			});
		} catch (err) {
			this.log(`Socket creation error: ${err.message}`, true);
			this.alive = false;
			this.needReconnect = true;
		}
	}

	tryReconnect() {
		this.log(`Attempting to reconnect ${UdpConnector.NAME} sockets...`);

		if (this.hostSocket) this.hostSocket.close();
		if (this.clientSocket) this.clientSocket.close();

		this.setupSockets();
		this.alive = true;
		this.needReconnect = false;
	}

	async run() {
		while ((this.needReconnect || !this.hostSocket || !this.clientSocket) && !this.shutdown) {
			await new Promise(resolve => setTimeout(resolve, 3000));
			this.tryReconnect();
		}

		const loop = async () => {
			if (this.shutdown) return;

			while (this.pendingPackets.length > 0) {
				const command = this.pendingPackets.shift();
				const buf = Buffer.from(command);
				try {
					this.clientSocket.send(buf, 0, buf.length, this.clientPort, UdpConnector.SOCKET_ADDRESS);
					const data = JSON.parse(command);
					if (data?.runtimeId !== undefined) {
						this.processedPackets.push(data.runtimeId);
					}
				} catch (err) {
					this.log(`Send to client failed: ${err.message}`, true);
					this.alive = false;
					this.needReconnect = true;
					return setTimeout(loop, 3000);
				}
			}

			while (this.returningPackets.length > 0) {
				const command = this.returningPackets.shift();
				let port = 0;
				try {
					const data = JSON.parse(command);
					port = data?.data?.remote_port || 0;
					const buf = Buffer.from(command);
					this.hostSocket.send(buf, 0, buf.length, port, UdpConnector.SOCKET_ADDRESS);
					if (data?.runtimeId !== undefined) {
						this.returnedPackets.push(data.runtimeId);
					}
				} catch (err) {
					this.log(`Send to host failed: ${err.message}`, true);
					this.alive = false;
					this.needReconnect = true;
					return setTimeout(loop, 3000);
				}
			}

			setTimeout(loop, 100);
		};

		loop();
	}
}
