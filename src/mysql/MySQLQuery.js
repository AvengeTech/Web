import * as mysql from 'mysql';

export class MySQLQuery {

	#params = [];
	#query = '';

	/**
	 * @param {string} query
	 * @param {string[]} params
	 */
	constructor(query, params = []) {
		this.#query = query;
		this.#params = params;
	}

	/**
	 * @returns {string}
	 */
	getQuery() {
		return mysql.format(this.#query, this.#params);
	}

}