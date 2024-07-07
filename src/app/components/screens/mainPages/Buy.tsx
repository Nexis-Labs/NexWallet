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

      const delegateIx = web3.StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: fromWallet.publicKey,
        votePubkey: new web3.PublicKey(voteAcc.votePubkey),
      });

      const transaction = new web3.Transaction().add(
        createStakeAccountIx,
        delegateIx,
      );

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
    <div className="bg-black shadow-lg rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Validator Information</h2>
      <p>Node Pubkey: {voteAcc.nodePubkey}</p>
      <p>Vote Pubkey: {voteAcc.votePubkey}</p>
      <p>Root Slot: {voteAcc.rootSlot}</p>
      <p>Activated Stake: {voteAcc.activatedStakeStr}</p>
      <p>Commission: {voteAcc.activatedStakeStr}</p>
      {displayInputs ? (
        <>
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded mb-2"
          />
          <button
            onClick={handleStake}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Stake Now
          </button>
          <button
            onClick={() => setDisplayInputs(false)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={() => setDisplayInputs(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Delegate
        </button>
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
  const [allStakes, setAllStakes] = useState<any[]>([]);

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

  useEffect(() => {
    const getUserStakes = async () => {
      const seed = await bip39.mnemonicToSeed(seedPhrase.join(" ").trimEnd());
      const seedHex = seed.slice(0, 32).toString("hex");
      const keyPair = nacl.sign.keyPair.fromSeed(Buffer.from(seedHex, "hex"));
      const fromWallet = web3.Keypair.fromSecretKey(
        Buffer.from(keyPair.secretKey),
      );
      const allStakeAccounts = await connection?.getParsedProgramAccounts(
        web3.StakeProgram.programId,
        {
          filters: [
            {
              memcmp: {
                offset: 12,
                bytes: fromWallet.publicKey.toBase58(),
              },
            },
          ],
        },
      );
      setAllStakes(allStakeAccounts as any);
    };

    if (connection) {
      getUserStakes();
    }
  }, [connection]);

  const handleUndelegate = async (stake: any) => {
    try {
      const seed = await bip39.mnemonicToSeed(seedPhrase.join(" ").trimEnd());
      const seedHex = seed.slice(0, 32).toString("hex");
      const keyPair = nacl.sign.keyPair.fromSeed(Buffer.from(seedHex, "hex"));
      const fromWallet = web3.Keypair.fromSecretKey(
        Buffer.from(keyPair.secretKey),
      );

      const undelegateIx = web3.StakeProgram.deactivate({
        stakePubkey: stake.pubkey,
        authorizedPubkey: fromWallet.publicKey,
      });

      const transaction = new web3.Transaction().add(undelegateIx);

      const signature = await web3.sendAndConfirmTransaction(
        connection!,
        transaction,
        [fromWallet],
      );

      console.log("Undelegate transaction signature:", signature);
      alert("Undelegate successful!");
    } catch (error) {
      console.error("Error undelegating:", error);
      alert("Undelegate failed!");
    }
  };

  const handleWithdraw = async (stake: any) => {
    try {
      const seed = await bip39.mnemonicToSeed(seedPhrase.join(" ").trimEnd());
      const seedHex = seed.slice(0, 32).toString("hex");
      const keyPair = nacl.sign.keyPair.fromSeed(Buffer.from(seedHex, "hex"));
      const fromWallet = web3.Keypair.fromSecretKey(
        Buffer.from(keyPair.secretKey),
      );

      const withdrawIx = web3.StakeProgram.withdraw({
        stakePubkey: stake.pubkey,
        authorizedPubkey: fromWallet.publicKey,
        toPubkey: fromWallet.publicKey,
        lamports: stake.account.lamports,
      });

      const transaction = new web3.Transaction().add(withdrawIx);

      const signature = await web3.sendAndConfirmTransaction(
        connection!,
        transaction,
        [fromWallet],
      );

      console.log("Withdraw transaction signature:", signature);
      alert("Withdraw successful!");
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Withdraw failed!");
    }
  };

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
          <div>
            Account Address: {accountAddress}
            <br />
            Account Balance: {accountBalance}
          </div>
          <h2
            className={classNames("font-bold text-brand-light", "text-xl mt-4")}
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
          <h2
            className={classNames("font-bold text-brand-light", "text-xl mt-4")}
          >
            Your Stakes
          </h2>
          {allStakes &&
            allStakes.map((stake: any) => {
              return (
                <div
                  key={stake.pubkey.toString()}
                  className="bg-black shadow-lg rounded-lg p-4 mb-4"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    Stake Account: {stake.pubkey.toString()}
                  </h2>
                  <p>
                    <strong>Authorized Staker:</strong>{" "}
                    {stake.account.data.parsed.info.meta.authorized.staker}
                  </p>
                  <p>
                    <strong>Authorized Withdrawer:</strong>{" "}
                    {stake.account.data.parsed.info.meta.authorized.withdrawer}
                  </p>
                  <p>
                    <strong>Credits Observed:</strong>{" "}
                    {stake.account.data.parsed.info.stake.creditsObserved}
                  </p>
                  <p>
                    <strong>Activated Epoch:</strong>{" "}
                    {
                      stake.account.data.parsed.info.stake.delegation
                        .activationEpoch
                    }
                  </p>
                  <p>
                    <strong>Deactivation Epoch:</strong>{" "}
                    {
                      stake.account.data.parsed.info.stake.delegation
                        .deactivationEpoch
                    }
                  </p>
                  <p>
                    <strong>Stake:</strong>{" "}
                    {stake.account.data.parsed.info.stake.delegation.stake}
                  </p>
                  <p>
                    <strong>Warmup Cooldown Rate:</strong>{" "}
                    {
                      stake.account.data.parsed.info.stake.delegation
                        .warmupCooldownRate
                    }
                  </p>
                  <p>
                    <strong>Lamports:</strong> {stake.account.lamports}
                  </p>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleUndelegate(stake)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Undelegate
                    </button>
                    <button
                      onClick={() => handleWithdraw(stake)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              );
            })}
        </>
      ) : (
        <>
          <input
            type="text"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border p-2 rounded mb-2"
            placeholder="Enter Password"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Access Staking Page
          </button>
        </>
      )}
    </div>
  );
}

export default Buy;
