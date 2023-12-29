"use client";

import {
  keyStores,
  connect,
  utils,
  WalletConnection,
  KeyPair,
} from "near-api-js";
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
    </div>
  );
};

export default Home;
