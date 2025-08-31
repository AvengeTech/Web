import * as mysql from 'mysql';
import { config } from 'dotenv';
config();

import { MySQLQuery } from './MySQLQuery.js';
import { MySQLResult } from './MySQLResult.js';

export class MySQLProvider {

	/**
	 * @type {Object<string, Array<{query: MySQLQuery, returnData: MySQLResult|null, waitingReturn: boolean, callback: (MySQLResult|null)=>void}>>}
	 * @private
	 */
	#waitingQueries = {
		core: [],
		web: [],
		skyblock_1: [],
		skyblock_test: [],
		prison_1: [],
		prison_test: []
	};

	/**
	 * @type {Object<string, {connection: mysql.Connection|null, connecting: boolean, connected: boolean, needsReconnect: boolean, reconnectAttempts: number}>}
	 * @private
	 */
	#connections = {
		core: {
			connection: null,
			connecting: false,
			connected: false,
			needsReconnect: false,
			reconnectAttempts: 0
		},
		web: {
			connection: null,
			connecting: false,
			connected: false,
			needsReconnect: false,
			reconnectAttempts: 0
		},
		skyblock_1: {
			connection: null,
			connecting: false,
			connected: false,
			needsReconnect: false,
			reconnectAttempts: 0
		},
		skyblock_test: {
			connection: null,
			connecting: false,
			connected: false,
			needsReconnect: false,
			reconnectAttempts: 0
		},
		prison_1: {
			connection: null,
			connecting: false,
			connected: false,
			needsReconnect: false,
			reconnectAttempts: 0
		},
		prison_test: {
			connection: null,
			connecting: false,
			connected: false,
			needsReconnect: false,
			reconnectAttempts: 0
		},
	};

	constructor() { /* NOOP */ }

	async #createConnections() {
		var start = Date.now();
		return new Promise((__r) => {
			console.log('Creating MySQL connections...');
			var cData = Object.entries(this.#connections), done = cData.length;
			var __i = setInterval(() => {
				if (done >= cData.length) {
					console.log(`MySQL connection creations completed. Time elapsed: ${Date.now() - start}ms`);
					clearInterval(__i);
					__r();
				} else if (Date.now() - start > 10000) {
					console.warn(`MySQL connection creations took too long (${Date.now() - start}ms), aborting...`);
					clearInterval(__i);
					__r();
				}
			}, 100);
			for (var [name, connectionData] of cData) {
				var connection = connectionData.connection;
				if (connection == null) {
					connectionData.connecting = true;
					connection = mysql.createConnection({
						host: process.env.MYSQL_HOST,
						user: process.env.MYSQL_USER,
						password: process.env.MYSQL_PASSWORD,
						database: name,
						multipleStatements: true,
					});
					connection.connect((err) => {
						if (err) {
							++connectionData.reconnectAttempts;
							if (connectionData.reconnectAttempts < 5) connectionData.needsReconnect = true;
							else console.error(`Error connecting to MySQL database ${name}:`, err);
						} else {
							connectionData.connected = true;
							connectionData.connection = connection;
							console.log(`${connectionData.needsReconnect ? "Reconnected" : "Connected"} to MySQL database ${name}`);
							connectionData.needsReconnect = false;
							connectionData.reconnectAttempts = 0;
						}
						connectionData.connecting = false;
						this.#connections[name] = connectionData;
						done++;
						if (done >= cData.length) {
							console.log(`All MySQL connections have been processed. Time elapsed: ${Date.now() - start}ms`);
							clearInterval(__i);
							__r();
						}
					});
				} else {
					if (!connectionData.connected && !connectionData.connecting) {
						connectionData.connecting = true;
						connection.connect((err) => {
							if (err) {
								++connectionData.reconnectAttempts;
								if (connectionData.reconnectAttempts < 5) connectionData.needsReconnect = true;
								else console.error(`Error connecting to MySQL database ${name}:`, err);
							} else {
								connectionData.connected = true;
								console.log(`${connectionData.needsReconnect ? "Reconnected" : "Connected"} to MySQL database ${name}`);
								connectionData.needsReconnect = false;
								connectionData.reconnectAttempts = 0;
							}
							connectionData.connecting = false;
							this.#connections[name] = connectionData;
							done++;
							if (done >= cData.length) {
								console.log(`All MySQL connections have been processed. Time elapsed: ${Date.now() - start}ms`);
								clearInterval(__i);
								__r();
							}
						});
					} else console.debug(`MySQL connection for ${name} already exists and is connected!`);
				}
			}
		});
	}

	start() {
		this.#createConnections();
		setInterval(() => this.#tickBase(), 1);
	}

	/**
	 * Adds a query to the waiting queries list for a specific MySQL connection.
	 * 
	 * @param {string} name - The name of the MySQL connection to add the query to.
	 * @param {MySQLQuery} query - The SQL query to execute.
	 * @param {function(MySQLResult|null):void} callback - The callback function to execute when the query returns.
	 * @returns {void}
	 */
	addQuery(name, query, callback) {
		if (!this.#connections[name] || !this.#waitingQueries[name]) {
			console.warn(`MySQL connection for ${name} does not exist.`);
			return;
		}
		this.#waitingQueries[name].push({ query, waitingReturn: false, returnData: null, callback });
	}

	async #tickBase() {
		var cData = Object.entries(this.#connections);
		for (var [name, connectionData] of cData) {
			if (connectionData.needsReconnect && connectionData.reconnectAttempts < 5) {
				console.warn(`MySQL connection for ${name} is not connected, attempting to reconnect...`);
				await this.#createConnections();
			} else if (!connectionData.connected && !connectionData.connecting && connectionData.reconnectAttempts < 5) {
				console.warn(`MySQL connection for ${name} is not connected, attempting to reconnect...`);
				await this.#createConnections();
			}
		}
		for (var [name, queries] of Object.entries(this.#waitingQueries)) {
			if (!this.#connections[name]) {
				console.warn(`MySQL connection for ${name} does not exist.`);
				continue;
			}
			for (var i = 0; i < queries.length; i++) {
				var queryData = queries[i];
				if (queryData.waitingReturn) continue; // Skip if already waiting for a return
				var connection = this.getDB(name);
				if (connection) {
					queryData.waitingReturn = true;
					connection.query(queryData.query.getQuery(), (err, results) => {
						if (err) {
							console.error(`Error executing MySQL query for ${name}:`, err);
							queryData.returnData = null;
						} else {
							queryData.returnData = new MySQLResult(results);
						}
						queryData.waitingReturn = false;
					});
				} else {
					console.warn(`MySQL connection for ${name} is not connected.`);
				}
				if (queryData.returnData !== null) {
					(queryData.callback)(queryData.returnData);
					delete this.#waitingQueries[name];
				} else {
					console.warn(`MySQL query for ${name} has no return data.`);
					(queryData.callback)(MySQLResult.NULL());
					delete this.#waitingQueries[name];
				}
			}
		}
	}

	/**
	 * 
	 * Retrieves a MySQL connection by name. SYNCHRONOUS 
	 * 
	 * @returns {mysql.Connection|null} The MySQL connection for the specified name, or null if it does not exist or is not connected.
	 * @param {string} name - The name of the MySQL connection to retrieve.
	 */
	getDB(name) {
		var cData = this.#connections[name];
		if (!cData) {
			console.warn(`MySQL connection for ${name} does not exist.`);
			return null;
		}
		if (cData.needsReconnect) {
			console.warn(`MySQL connection for ${name} needs to be reconnected.`);
			this.#createConnections();
			return null;
		}
		if (cData.connecting) {
			console.warn(`MySQL connection for ${name} is currently connecting.`);
			return null;
		}
		if (!cData.connected) {
			console.warn(`MySQL connection for ${name} is not connected.`);
			return null;
		}
		return cData.connection;
	}
}