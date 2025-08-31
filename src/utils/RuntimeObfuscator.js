import pkg from "javascript-obfuscator";
const { obfuscate } = pkg;

export class RuntimeObfuscator {
	static obfuscateJS(data) {
		return obfuscate(data, {
			compact: true,
			controlFlowFlattening: true,
			deadCodeInjection: true,
			debugProtection: true,
			disableConsoleOutput: true,
			identifierNamesGenerator: 'hexadecimal',
			log: false,
			numbersToExpressions: true,
			renameGlobals: true,
			selfDefending: true,
			simplify: false,
			stringArray: true,
			stringArrayThreshold: 0.75
		})
	}
}