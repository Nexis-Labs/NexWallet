import { getSeedPhrase } from "core/client";
import { fromProtectedString, toProtectedString } from "lib/crypto-utils";
import React, { useEffect, useState } from "react";
import classNames from "clsx";
import * as bip39 from "bip39";
import bs58 from "bs58";
import nacl from "tweetnacl";
import * as web3 from "@solana/web3.js";
import { Input } from "app/components/ui/input";

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
    <div className="max-w-md rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black border-white">
      <div
        className="bg-black shadow-lg rounded-lg p-4 mb-4"
        style={{ border: "1px solid #4eba94" }}
      >
        <h2 className="text-sm font-semibold mb-2">{voteAcc.nodePubkey}</h2>
        {/* <p>Identity {voteAcc.nodePubkey}</p> */}
        {/* <p>Vote Pubkey: {voteAcc.votePubkey}</p> */}
        <p>Root Slot: {voteAcc.rootSlot}</p>
        <p>Activated Stake: {voteAcc.activatedStakeStr / 1e9} NZTs</p>
        <p>Commission: {voteAcc.commission} %</p>
        {displayInputs ? (
          <>
            <br />
            <Input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 rounded mb-2 mt-2"
            />
            <button
              className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block mt-4"
              onClick={handleStake}
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
                <span> Stake Now</span>
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.75 8.75L14.25 12L10.75 15.25"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
            <button
              className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block mt-4 ml-4"
              onClick={() => setDisplayInputs(false)}
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
                <span>Cancel</span>
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.75 8.75L14.25 12L10.75 15.25"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-red-400/0 via-red-400/90 to-red-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
          </>
        ) : (
          <button
            className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block mt-4"
            onClick={() => setDisplayInputs(true)}
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
              <span>Delegate</span>
              <svg
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
          </button>
        )}
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

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
            wsEndpoint: "wss://evm-devnet.nexis.network/ws",
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

  const deactivate = async (stakeAccount: any) => {
    const seed = await bip39.mnemonicToSeed(seedPhrase.join(" ").trimEnd());
    const seedHex = seed.slice(0, 32).toString("hex");
    const keyPair = nacl.sign.keyPair.fromSeed(Buffer.from(seedHex, "hex"));
    const wallet = web3.Keypair.fromSecretKey(Buffer.from(keyPair.secretKey));
    try {
      const deactivateTx = web3.StakeProgram.deactivate({
        stakePubkey: new web3.PublicKey(stakeAccount),
        authorizedPubkey: wallet.publicKey,
      });
      const deactivateTxId = await web3.sendAndConfirmTransaction(
        connection!,
        deactivateTx,
        [wallet],
      );
      console.log(`Stake account deactivated. Tx Id: ${deactivateTxId}`);

      // Check in on our stake account. It should now be inactive.
      await connection?.getStakeActivation(new web3.PublicKey(stakeAccount));
      alert("undelegated successfully");
    } catch (error) {
      console.log("errorrrr", await (error as any).getLogs());
    }
  };

  const withdraw = async (stakeAccount: any) => {
    const seed = await bip39.mnemonicToSeed(seedPhrase.join(" ").trimEnd());
    const seedHex = seed.slice(0, 32).toString("hex");
    const keyPair = nacl.sign.keyPair.fromSeed(Buffer.from(seedHex, "hex"));
    const wallet = web3.Keypair.fromSecretKey(Buffer.from(keyPair.secretKey));
    const stakeAccountPublicKey = new web3.PublicKey(stakeAccount);
    const stakeBalance = await connection?.getBalance(stakeAccountPublicKey);
    try {
      const withdrawTx = web3.StakeProgram.withdraw({
        stakePubkey: stakeAccountPublicKey,
        authorizedPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey,
        lamports: stakeBalance!,
      });

      const withdrawTxId = await web3.sendAndConfirmTransaction(
        connection!,
        withdrawTx,
        [wallet],
      );

      console.log(`Stake account withdrawn. Tx Id: ${withdrawTxId}`);

      // Confirm that our stake account balance is now 0
      await connection?.getBalance(stakeAccountPublicKey);
      alert("withdrawn successfully");
    } catch (error) {
      console.log("errorrrr", await (error as any).getLogs());
      if (
        (error as any)
          .toString()
          .includes("Transaction was not confirmed in 30.00 seconds")
      ) {
        setTimeout(function () {
          window.location.reload();
        }, 5000);
      } else {
        alert("error withdrawing");
      }
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
                    <strong>Lamports:</strong> {stake.account.lamports / 1e9}
                  </p>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => {
                        deactivate(stake.pubkey);
                        withdraw(stake.pubkey);
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Undelegate
                    </button>
                    :
                  </div>
                </div>
              );
            })}
        </>
      ) : (
        <>
          <Input
            value={password}
            className="border p-2 rounded mb-2"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
          />
          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] mt-2"
            type="submit"
            onClick={handleSubmit}
          >
            Access Staking Page &rarr;
            <BottomGradient />
          </button>
        </>
      )}
    </div>
  );
}

export default Buy;
