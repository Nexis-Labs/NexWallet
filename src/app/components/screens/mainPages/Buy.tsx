import { getSeedPhrase } from "core/client";
import { fromProtectedString, toProtectedString } from "lib/crypto-utils";
import React, { useEffect, useState } from "react";
import classNames from "clsx";
import * as bip39 from "bip39";
import bs58 from "bs58";
import nacl from "tweetnacl";
import * as web3 from "@solana/web3.js";

interface Props {
  voteAcc: any;
  seedPhrase: string[];
}

function VoteAccountCard({ voteAcc, seedPhrase }: Props) {
  const [displayInputs, setDisplayInputs] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");

  const connection = new web3.Connection("https://evm-devnet.nexis.network", {
    commitment: "singleGossip",
    wsEndpoint: "wss://evm-devnet.nexis.network/ws",
  });

  const handleStake = async () => {
    try {
      const seed = await bip39.mnemonicToSeed(seedPhrase.join(" ").trimEnd());
      const seedHex = seed.slice(0, 32).toString("hex");
      const keyPair = nacl.sign.keyPair.fromSeed(Buffer.from(seedHex, "hex"));
      const fromWallet = web3.Keypair.fromSecretKey(
        Buffer.from(keyPair.secretKey),
      );
      const stakeAccount = web3.Keypair.generate();

      // Fund the stake account with the specified amount
      const lamports = web3.LAMPORTS_PER_SOL * parseFloat(amount);
      const createStakeAccountIx = web3.StakeProgram.createAccount({
        fromPubkey: fromWallet.publicKey,
        stakePubkey: stakeAccount.publicKey,
        authorized: new web3.Authorized(
          fromWallet.publicKey,
          fromWallet.publicKey,
        ),
        lamports,
      });

      // Delegate the stake
      const delegateIx = web3.StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: fromWallet.publicKey,
        votePubkey: new web3.PublicKey(voteAcc.votePubkey),
      });

      // Create transaction and add both instructions
      const transaction = new web3.Transaction().add(
        createStakeAccountIx,
        delegateIx,
      );

      // Send the transaction
      const signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet, stakeAccount],
      );

      console.log("Stake transaction signature:", signature);
      alert("Stake successful!");
    } catch (error) {
      console.error("Error staking:", error);
      window.location.reload();
      alert("Stake failed!");
    }
  };

  return (
    <div>
      node pubkey : {voteAcc.nodePubkey}
      <br />
      vote pubkey : {voteAcc.votePubkey}
      <br />
      rootSlot : {voteAcc.rootSlot}
      <br />
      activated stake: {voteAcc.activatedStakeStr}
      <br />
      commission: {voteAcc.activatedStakeStr}
      <br />
      {displayInputs ? (
        <>
          <input
            placeholder="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleStake}>Stake Now</button>
          <button onClick={() => setDisplayInputs(false)}>Cancel</button>
        </>
      ) : (
        <button onClick={() => setDisplayInputs(true)}>Delegate</button>
      )}
    </div>
  );
}

function Buy() {
  const [password, setPassword] = useState<string>("");
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [accountAddress, setAccountAddress] = useState<string>("");
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [connection, setConnection] = useState<web3.Connection>();
  const [voteAccounts, setVoteAccounts] = useState<any>([]);

  const handleSubmit = async () => {
    try {
      const _seedPhrase = await getSeedPhrase(password);
      const seedPhrase: string[] = [];
      const _encryptedSeedPhrase = fromProtectedString(_seedPhrase.phrase)
        .split(/\s+/g)
        .map(toProtectedString);
      _encryptedSeedPhrase.forEach((v) =>
        seedPhrase.push(fromProtectedString(v)),
      );
      if (seedPhrase.length > 0) {
        setSeedPhrase(seedPhrase);
        const seed = await bip39.mnemonicToSeed(seedPhrase.join(" ").trimEnd());
        const seedHex = seed.slice(0, 32).toString("hex");

        const keyPair = nacl.sign.keyPair.fromSeed(Buffer.from(seedHex, "hex"));
        const publicKey = bs58.encode(Buffer.from(keyPair.publicKey));
        setAccountAddress(publicKey);

        const _connection = new web3.Connection(
          "https://evm-devnet.nexis.network",
          {
            commitment: "singleGossip",
          },
        );
        setConnection(_connection);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //fetch balance if connection
  useEffect(() => {
    const fetchBalance = async () => {
      const details = await connection?.getBalance(
        new web3.PublicKey(accountAddress!),
      );
      if (!details) {
        setAccountBalance(0);
      } else {
        setAccountBalance(details / 1e9);
      }
    };

    const fetchValidators = async () => {
      const response = await connection?.getVoteAccounts();
      if (response) {
        setVoteAccounts((response as any).current);
      } else {
        setVoteAccounts([]);
      }
    };

    if (connection) {
      fetchBalance();
      fetchValidators();
    }
  }, [connection]);

  return (
    <div>
      <h2 className={classNames("font-bold text-brand-light", "text-xl mt-4")}>
        Nexis Native Staking
      </h2>
      <h2 className={classNames(" text-brand-light", "text-lg mt-2 mb-8")}>
        Earn rewards by delegating nodes to strengthen network security on Nexis
        Native (Devnet)
      </h2>
      {seedPhrase.length > 0 ? (
        <>
          <>
            <div>
              Account Address: {accountAddress}
              <br />
              Account Balance: {accountBalance}
            </div>
            <h2
              className={classNames(
                "font-bold text-brand-light",
                "text-xl mt-4",
              )}
            >
              Validators {voteAccounts.length}
            </h2>
            {voteAccounts.map((voteAcc: any) => {
              return (
                <VoteAccountCard
                  voteAcc={voteAcc}
                  seedPhrase={seedPhrase}
                  key={voteAcc.votePubkey}
                />
              );
            })}
          </>
        </>
      ) : (
        <>
          <input
            type="text"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <button onClick={handleSubmit}>access staking page</button>
        </>
      )}
    </div>
  );
}

export default Buy;
