"use client";

import { keyStores, utils, KeyPair } from "near-api-js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import NearConnection from "@/config/near";

const schema = yup.object().shape({
  newAccountId: yup.string().required(),
});

const Home = () => {
  const [accountId, setAccountId] = useState("");
  const [keyPair, setKeyPair] = useState<KeyPair>();
  const [accountData, setAccountData] = useState<
    | {
        balance: string;
        accountId: string;
      }
    | undefined
  >();
  const [search, setSearch] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleCreateAccount = async (data: { newAccountId: string }) => {
    const nearConnection = new NearConnection();
    await nearConnection.createConnection();

    const keyStore = new keyStores.BrowserLocalStorageKeyStore();
    const keyPair = utils.KeyPairEd25519.fromRandom();
    const accountId = `${data.newAccountId}.testnet`;
    keyStore.setKey("testnet", accountId, keyPair);

    setAccountId(accountId);
    setKeyPair(keyPair);

    const connection = nearConnection.getConnection();
    if (connection) {
      const account = await connection.createAccount(
        accountId,
        keyPair.getPublicKey()
      );

      console.log(await account.state());
    }
  };

  const viewAccount = async (accountId: string) => {
    const nearConnection = new NearConnection();
    await nearConnection.createConnection();
    const connection = nearConnection.getConnection();

    if (connection) {
      const account = await connection.account(accountId);
      setAccountData({
        balance: (await account.getAccountBalance()).available,
        accountId,
      });
    }
  };

  const deleteAccount = async (accountId: string, beneficiaryId?: string) => {
    const nearConnection = new NearConnection();
    await nearConnection.createConnection();
    const account = await nearConnection.getConnection()?.account(accountId);
    if (account) {
      await account.deleteAccount(beneficiaryId ?? "testaccountfs.testnet");
    }
  };

  const transfer = async (accountId: string, amount: string) => {
    const nearConnection = new NearConnection();
    await nearConnection.createConnection();
    const account = await nearConnection.getConnection()?.account(accountId);
    if (account) {
      const receipt = await account.sendMoney(
        "testaccountfs.testnet",
        utils.format.parseNearAmount(amount)
      );
      console.log(receipt);
    }
  };

  return (
    <div className="font-sans p-5">
      <p className="font-bold text-2xl mb-4">Account ID: {accountId}</p>
      <form
        onSubmit={handleSubmit(handleCreateAccount)}
        className="mt-5 space-y-4 space-x-4"
      >
        <input
          {...register("newAccountId")}
          placeholder="New Account ID"
          className="p-2 text-lg w-60 text-black border-2 border-gray-300 rounded-md h-10"
        />
        {errors.newAccountId && (
          <p className="text-red-500">{errors.newAccountId.message}</p>
        )}
        <button
          type="submit"
          className="p-2 text-lg mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 h-10"
        >
          Create Account
        </button>
      </form>
      <div className="mt-5 space-y-4 space-x-4">
        <input
          placeholder="Account ID"
          className="p-2 text-lg w-60 text-black border-2 border-gray-300 rounded-md h-10"
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          placeholder="Transfer Amount"
          className="p-2 text-lg w-60 text-black border-2 border-gray-300 rounded-md h-10"
          onChange={(e) => setTransferAmount(e.target.value)}
        />
        <button
          className="p-2 text-lg mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 h-10"
          onClick={() => viewAccount(search)}
        >
          View Account
        </button>
        <button
          className="p-2 text-lg mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 h-10"
          onClick={() => deleteAccount(search)}
        >
          Delete Account
        </button>
        <button
          className="p-2 text-lg mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 h-10"
          onClick={() => transfer(search, transferAmount)}
        >
          Transfer
        </button>
        {accountData && (
          <div className="mt-5">
            <p className="font-bold text-2xl mb-4">Account Details:</p>
            <p>Account ID: {accountData.accountId}</p>
            <p>Balance: {utils.format.formatNearAmount(accountData.balance)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
