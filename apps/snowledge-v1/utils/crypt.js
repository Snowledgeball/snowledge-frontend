import crypto from 'crypto';
// Fonction pour dériver une clé de chiffrement à partir du mot de passe de l'utilisateur
function deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 32, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
        });
    });
}

// Fonction pour chiffrer la clé privée
export async function encryptPrivateKey(privateKey, password) {
    const salt = crypto.randomBytes(16); // Génère un sel aléatoire
    const iv = crypto.randomBytes(16); // Génère un vecteur d'initialisation aléatoire
    const key = await deriveKey(password, salt); // Dérive la clé de chiffrement

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        encryptedPrivateKey: encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex')
    };
}

// Fonction pour déchiffrer la clé privée
export async function decryptPrivateKey(encryptedPrivateKey, password, saltHex, ivHex) {
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const key = await deriveKey(password, salt);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

// // Exemple d'utilisation
// (async () => {
//     const privateKey = 'votre_clé_privée';
//     const password = 'mot_de_passe_utilisateur';

//     // Chiffrement
//     const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);
//     console.log('Clé privée chiffrée:', encryptedPrivateKey);
//     console.log('Sel:', salt);
//     console.log('IV:', iv);

//     // Déchiffrement
//     const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, password, salt, iv);
//     console.log('Clé privée déchiffrée:', decryptedPrivateKey);
// })();
