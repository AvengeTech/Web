export class MySQLResult {

	/**
	 * @type {boolean}
	 */
	#success = false;
	#rows = [];

	#changedRows = 0;

	/**
	 * @param {Object} rawResult
	 * @param {boolean} success default = true
	 */
	constructor(rawResult, success = true) {
		this.#success = success;
		if (rawResult.changedRows) {
			this.#changedRows = rawResult.changedRows;
		}
		var rows = [], rwkys = Object.keys(rawResult);
		for (var i = 0; i < rwkys.length; i++) {
			var key = rwkys[i];
			if (parseInt(key) !== key) return;
			key = parseInt(key);
			if (!isNaN(key)) {
				rs = rawResult[key];
				if (rs !== null && typeof rs === 'object') {
					rows.push(rs);
				}
			}
		}
		this.#rows = rows;
	}

	static NULL() {
		return new MySQLResult({}, false);
	}

	/**
	 * @returns {boolean}
	 */
	success() {
		return this.#success;
	}

	/**
	 * @returns {Array<Object>}
	 */
	getRows() {
		return this.#rows;
	}

	/**
	 * @returns {number}
	 */
	getChangedRows() {
		return this.#changedRows;
	}
}