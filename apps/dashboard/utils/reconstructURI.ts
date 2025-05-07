export const reconstructURI = async (byteArray: string[]): Promise<string> => {
    const numberOfChunks = parseInt(byteArray[0], 16); // Nombre de blocs data

    const dataChunks = byteArray.slice(1, 1 + numberOfChunks); // Les blocs
    let reconstructedHex = dataChunks.join(""); // Concaténer les chunks hex

    // Ajouter le pending_word si sa longueur est > 0
    const pendingWordHex = byteArray[1 + numberOfChunks]; // pending_word
    const pendingWordLen = parseInt(byteArray[2 + numberOfChunks], 16); // pending_word_len

    if (pendingWordLen > 0) {
        reconstructedHex += pendingWordHex.slice(2, 2 + pendingWordLen * 2); // Extraire seulement les bytes utiles
    }

    // Convertir l'hexadécimal en chaîne de texte
    const uri = Buffer.from(reconstructedHex, "hex").toString("utf-8");

    return uri;
};

// Exemple d'utilisation
// const byteArrayFromContract = [
//     "0x3",
//     "0x696e6469676f2d68696464656e2d6d6565726b61742d37372e6d7970696e61",
//     "0x74612e636c6f75642f697066732f6261666b72656964797963787262366932",
//     "0x657468706a67646f626834793566756874756b6971746a616d623775346b6f",
//     "0x6370633562686337707134",
//     "0xb"
// ];

// console.log("Reconstructed URI:", reconstructURI(byteArrayFromContract));