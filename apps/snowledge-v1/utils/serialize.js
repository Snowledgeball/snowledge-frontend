import { encodeShortString, stark } from "starknet";

// Fonction pour sérialiser une chaîne en ByteArray Cairo-compatible
export function serializeByteArray(inputString) {
    const utf8Encoder = new TextEncoder();
    const bytes = utf8Encoder.encode(inputString);

    const CHUNK_SIZE = 31;
    let numWords = Math.floor(bytes.length / CHUNK_SIZE);
    let pendingWord = 0n;
    let pendingWordLen = bytes.length % CHUNK_SIZE;

    // Convertir les 31 premiers bytes en felt252
    let feltArray = [];
    for (let i = 0; i < numWords; i++) {
        let chunk = bytes.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        let chunkHex = "0x" + Buffer.from(chunk).toString("hex");
        feltArray.push(BigInt(chunkHex));
    }

    // Traiter le dernier morceau (pending word)
    if (pendingWordLen > 0) {
        let lastChunk = bytes.slice(numWords * CHUNK_SIZE);
        let lastChunkHex = "0x" + Buffer.from(lastChunk).toString("hex");
        pendingWord = BigInt(lastChunkHex);
    }

    return [numWords, ...feltArray, pendingWord, pendingWordLen];
}