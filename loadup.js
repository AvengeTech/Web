import { config } from 'dotenv';
config();

String.prototype.trim = function(...characters) {
	let str = this.toString();
	if (characters.length < 1) {
		characters = [' ', '\n', '\r', '\t', '　']; // Default characters to trim
	}
	const chars = characters.map(c => c.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('');
	const regex = new RegExp(`^[${chars}]+|[${chars}]+$`, 'g');
	return str.replace(regex, '');
}

import { MySQLProvider } from './src/mysql/MySQLProvider.js';
import { WebApp } from './src/network/http/WebApp.js';
import { Network } from './src/network/udp/Network.js';

const mysql = new MySQLProvider();

const network = new Network;
process.tick = 0;
setInterval(() => network.tick(++process.tick), 1);

const webApp = new WebApp(mysql);