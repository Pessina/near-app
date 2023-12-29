"use client";

import { keyStores, connect, utils, WalletConnection } from "near-api-js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import nearConnection from "@/config/near";

const schema = yup.object().shape({
  newAccountId: yup.string().required(),
});

const Home = () => {
  const [accountId, setAccountId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleCreateAccount = async (data: { newAccountId: string }) => {
    const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();
    const keyPair = utils.KeyPairEd25519.fromRandom();
    const accountId = data.newAccountId;
    myKeyStore.setKey("testnet", accountId, keyPair);

    setAccountId(accountId);
    setPublicKey(keyPair.getPublicKey().toString());
    setPrivateKey(keyPair.secretKey);

    const connection = nearConnection.getConnection();
    if (connection) {
      const account = await connection.createAccount(
        accountId,
        keyPair.getPublicKey()
      );
    }
  };

  return (
    <div>
      <p>Account ID: {accountId}</p>
      <p>Public Key: {publicKey}</p>
      <p>Private Key: {privateKey}</p>
      <form onSubmit={handleSubmit(handleCreateAccount)}>
        <input {...register("newAccountId")} placeholder="New Account ID" />
        {errors.newAccountId && <p>{errors.newAccountId.message}</p>}
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default Home;
