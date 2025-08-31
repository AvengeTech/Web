export class Player {

	/** @type {string} */
	gamertag;
	/** @type {number} */
	xuid;
	/** @type {string} */
	identifier;
	/** @type {?string} */
	nickname;

	/**
	 * @param {string} gamertag
	 * @param {number} xuid
	 * @param {string} identifier
	 * @param {string} nickname
	 */
	constructor(gamertag, xuid, identifier, nickname = null) {
		this.gamertag = gamertag;
		this.xuid = xuid;
		this.identifier = identifier;
		this.nickname = nickname;
	}

	getGamertag() {
		return this.gamertag;
	}

	getXuid() {
		return this.xuid;
	}

	hasNick() {
		return (this.nickname?.trim().length ?? 0) > 0;
	}

	getNick() {
		return this.nickname;
	}

	getIdentifier() {
		return this.identifier;
	}

}