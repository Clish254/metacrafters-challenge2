// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const getWalletBalance = async (keypair, walletName) => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // Make a wallet (keypair) from privateKey and get its balance
        const walletBalance = await connection.getBalance(
            keypair.publicKey
        );
        console.log(`${walletName} balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
        return parseInt(walletBalance) / LAMPORTS_PER_SOL
    } catch (err) {
        console.log(err);
    }
};

const transferSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key

    const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    await getWalletBalance(from, "from")
    await getWalletBalance(to, "to")
    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");
    await getWalletBalance(from, "from")

    // Send money from "from" wallet and into "to" wallet
    let transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: LAMPORTS_PER_SOL * 1
        })
    );

    // Sign transaction
    let signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    const senderBalance = await getWalletBalance(from, "from")
    await getWalletBalance(to, "to")
    // transfer 50% of the sender's balance to another wallet
    const recipient = Keypair.generate()

    let transaction2 = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: recipient.publicKey,
            lamports: LAMPORTS_PER_SOL * (senderBalance / 2)
        })
    );

    // Sign transaction
    let signature2 = await sendAndConfirmTransaction(
        connection,
        transaction2,
        [from]
    );
    console.log('Signature 2 is ', signature);
    await getWalletBalance(from, "from")
    await getWalletBalance(recipient, "recipient")
}

transferSol();
