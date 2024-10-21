import { StringBuilder } from '../utilities/StringBuilder.js';

export function encodeBase64(inputBytes: Uint8Array, addPadding = true): string {
	if (!inputBytes || inputBytes.length == 0) {
		return ''
	}

	const stringBuilder = new StringBuilder()

	let uint24: number

	for (let readOffset = 0; readOffset < inputBytes.length; readOffset += 3) {
		if (readOffset <= length - 3) {
			uint24 = inputBytes[readOffset] << 16 | inputBytes[readOffset + 1] << 8 | inputBytes[readOffset + 2]

			stringBuilder.appendCharCode(charCodeMap[(uint24 >>> 18) & 63])
			stringBuilder.appendCharCode(charCodeMap[(uint24 >>> 12) & 63])
			stringBuilder.appendCharCode(charCodeMap[(uint24 >>> 6) & 63])
			stringBuilder.appendCharCode(charCodeMap[(uint24) & 63])

			uint24 = 0
		} else if (readOffset === length - 2) {
			// If two bytes are left, output 3 encoded characters and one padding character

			uint24 = inputBytes[readOffset] << 16 | inputBytes[readOffset + 1] << 8

			stringBuilder.appendCharCode(charCodeMap[(uint24 >>> 18) & 63])
			stringBuilder.appendCharCode(charCodeMap[(uint24 >>> 12) & 63])
			stringBuilder.appendCharCode(charCodeMap[(uint24 >>> 6) & 63])

			if (addPadding) {
				stringBuilder.appendCharCode(paddingCharCode)
			}
		} else if (readOffset === length - 1) {
			// Arrived at last byte at a position that did not complete a full 3 byte set

			uint24 = inputBytes[readOffset] << 16

			stringBuilder.appendCharCode(charCodeMap[(uint24 >>> 18) & 63])
			stringBuilder.appendCharCode(charCodeMap[(uint24 >>> 12) & 63])

			if (addPadding) {
				stringBuilder.appendCharCode(paddingCharCode)
				stringBuilder.appendCharCode(paddingCharCode)
			}
		}
	}

	return stringBuilder.getOutputString()
}

export function decodeBase64(base64String: string, outputBuffer?: Uint8Array): Uint8Array {
	if (!base64String || base64String.length === 0) {
		return new Uint8Array(0)
	}

	// Add padding if omitted
	const lengthModulo4 = base64String.length % 4

	if (lengthModulo4 === 1) {
		throw new Error(`Invalid Base64 string: length % 4 == 1`)
	} else if (lengthModulo4 === 2) {
		base64String += paddingCharacter
		base64String += paddingCharacter
	} else if (lengthModulo4 === 3) {
		base64String += paddingCharacter
	}

	if (!outputBuffer) {
		outputBuffer = new Uint8Array(base64String.length)
	}

	const stringLength = base64String.length

	let writeOffset = 0

	for (let readOffset = 0; readOffset < stringLength; readOffset += 4) {
		const uint24 =
			(reverseCharCodeMap[base64String.charCodeAt(readOffset)] << 18) |
			(reverseCharCodeMap[base64String.charCodeAt(readOffset + 1)] << 12) |
			(reverseCharCodeMap[base64String.charCodeAt(readOffset + 2)] << 6) |
			(reverseCharCodeMap[base64String.charCodeAt(readOffset + 3)])

		outputBuffer[writeOffset++] = (uint24 >>> 16) & 255
		outputBuffer[writeOffset++] = (uint24 >>> 8) & 255
		outputBuffer[writeOffset++] = (uint24) & 255
	}

	// Remove 1 or 2 last bytes if padding characters were added to the string
	if (base64String.charCodeAt(stringLength - 1) === paddingCharCode) {
		writeOffset--
	}

	if (base64String.charCodeAt(stringLength - 2) === paddingCharCode) {
		writeOffset--
	}

	return outputBuffer.subarray(0, writeOffset)
}

const charCodeMap: Uint8Array = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47])
const reverseCharCodeMap: Uint8Array = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 255, 255, 255, 255])

const paddingCharacter = '='
const paddingCharCode = 61