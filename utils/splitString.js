export function splitStringToFeltArray(input) {
    const chunkSize = 30; // Limite imposée par felt
    const chunks = [];

    for (let i = 0; i < input.length; i += chunkSize) {
        const chunk = input.slice(i, i + chunkSize);
        const feltChunk = BigInt("0x" + Buffer.from(chunk).toString("hex"));
        chunks.push(feltChunk);
    }

    console.log("URI split", chunks);


    return chunks;

}

