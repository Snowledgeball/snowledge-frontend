import { ec, stark, hash, Account, Provider, Contract } from "starknet";

/**
 * Charge les variables d'environnement pour le réseau StarkNet
 */
const NETWORK = process.env.NEXT_PUBLIC_STARKNET_NETWORK;
const NODE_URL = process.env.NEXT_PUBLIC_STARKNET_NODE_URL;
const ETH_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS;
const ACCOUNT_CLASS_HASH = process.env.NEXT_PUBLIC_ACCOUNT_CLASS_HASH;
const FUNDER_PRIVATE_KEY = process.env.NEXT_PUBLIC_FUNDER_PRIVATE_KEY;
const FUNDER_ADDRESS = process.env.NEXT_PUBLIC_FUNDER_ADDRESS;

/**
 * Convertit un montant en Uint256 (format StarkNet)
 */
const toUint256 = (value) => {
    const bigValue = BigInt(value);
    return {
        low: `0x${(bigValue & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")).toString(16)}`,
        high: `0x${(bigValue >> 128n).toString(16)}`
    };
};

/**
 * Vérifie le solde d'une adresse en ETH natif sur StarkNet
 */
export const getBalance = async (address) => {
    const provider = new Provider({ network: NETWORK, nodeUrl: NODE_URL });
    const ethContract = new Contract(
        [
            {
                name: "balanceOf",
                type: "function",
                inputs: [{ name: "account", type: "core::starknet::contract_address::ContractAddress" }],
                outputs: [{ type: "core::integer::u256" }],
                state_mutability: "view"
            }
        ],
        ETH_TOKEN_ADDRESS,
        provider
    );

    try {
        const balance = await ethContract.call("balanceOf", [address]);
        return Number(balance);
    } catch (error) {
        console.error("Erreur lors de la récupération du solde :", error);
        throw error;
    }
};

/**
 * Attends que les fonds soient crédités sur une adresse
 */
const waitForFunds = async (address, requiredBalance, interval = 5000) => {
    console.log("waitForFunds");
    while (true) {
        const balance = await getBalance(address);
        if (balance >= requiredBalance) {

            console.log("Les fonds nécessaires sont disponibles !");
            break;
        }
        console.log("balance", balance);
        console.log("requiredBalance", requiredBalance);
        console.log("Attente de l'arrivée des fonds...");
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
};

/**
 * Transfère des fonds en ETH natif
 */
export const fundAccount = async (recipientAddress, amount) => {
    console.log("fundAccount");
    const provider = new Provider({ network: NETWORK, nodeUrl: NODE_URL });
    const funderAccount = new Account(provider, FUNDER_ADDRESS, FUNDER_PRIVATE_KEY);
    const ethContract = new Contract(
        [
            {
                name: "transfer",
                type: "function",
                inputs: [
                    { name: "recipient", type: "core::starknet::contract_address::ContractAddress" },
                    { name: "amount", type: "core::integer::u256" }
                ],
                outputs: [{ type: "core::bool" }],
                state_mutability: "external"
            }
        ],
        ETH_TOKEN_ADDRESS,
        funderAccount
    );

    const u256Amount = toUint256(amount);

    try {
        const estimatedFee = await ethContract.estimate("transfer", [recipientAddress, u256Amount]);
        const tx = await ethContract.invoke("transfer", [recipientAddress, u256Amount], {
            maxFee: estimatedFee.overall_fee * BigInt(2)
        });

        console.log(`Transfert réussi ! Hash de la transaction : ${tx.transaction_hash}`);
        return tx.transaction_hash;
    } catch (error) {
        console.error("Erreur lors du transfert :", error);
        throw error;
    }
};

/**
 * Déploie un compte StarkNet
 */
export const deployAccountContract = async (privateKey, publicKey) => {
    console.log("deployAccountContract");
    const provider = new Provider({ network: NETWORK, nodeUrl: NODE_URL });
    const salt = "0x0";
    const accountAddress = hash.calculateContractAddressFromHash(

        salt,
        ACCOUNT_CLASS_HASH,
        [publicKey],
        0
    );

    // A augmenter quand on sera en prod pour valider d'autres transactions
    const amount = BigInt("10000000000000"); // 0.01 ETH en WEI

    try {
        await fundAccount(accountAddress, amount);
        await waitForFunds(accountAddress, amount);
    } catch (error) {
        console.error("Erreur lors du financement de l'adresse :", error);
        return;
    }

    const account = new Account(provider, accountAddress, privateKey);

    try {
        const deployTx = await account.deployAccount({
            classHash: ACCOUNT_CLASS_HASH,
            constructorCalldata: [publicKey],
            addressSalt: salt
        });

        console.log(`Compte déployé avec succès ! Hash de transaction : ${deployTx.transaction_hash}`);
        return { transactionHash: deployTx.transaction_hash, accountAddress };
    } catch (error) {
        console.error("Erreur lors du déploiement du compte :", error);
        throw error;
    }
};

/**
 * Génère une clé privée, une clé publique et une adresse StarkNet
 */
export const generateStarkNetAddress = () => {
    const privateKey = stark.randomAddress();
    const publicKey = ec.starkCurve.getStarkKey(privateKey);

    const accountAddress = hash.calculateContractAddressFromHash(
        "0x0", // salt
        ACCOUNT_CLASS_HASH, // Class hash
        [publicKey], // constructor calldata
        0 // deployer address
    );

    console.log("accountAddress", accountAddress);
    console.log("publicKey", publicKey);
    console.log("privateKey", privateKey);

    return { privateKey, publicKey, accountAddress };
};
