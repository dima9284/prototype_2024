import React, { useState, useEffect, FormEvent } from "react";
import { fakeAuthProvider } from "@/middleware/auth";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import UserContract from "~/build/contracts/UserRegistration.json";
import { toast } from "react-toastify";

const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL

const LoginAdmin: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [contract, setContract] = useState<Web3.eth.Contract | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const web3Instance = new Web3(new Web3.providers.HttpProvider(GANACHE_RPC_URL));
        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = UserContract.networks[networkId];
        if (deployedNetwork) {
          const instance = new web3Instance.eth.Contract(
            UserContract.abi,
            deployedNetwork.address
          );
          setContract(instance);
        } else {
          toast.error("Contract not deployed on the detected network.");
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    init();
  }, []);

  const adminLogin = async () => {
    try {
      await contract?.methods
        .adminLogin("admin", "password")
        .send({ from: accounts[0] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username === "admin" && password === "password") {
      await adminLogin();
      await fakeAuthProvider.loginAdmin();
      navigate("/admin");
    } else {
      toast.error("Invalid username or password");
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ textAlign: "left", marginTop: "20px" }}>
      <Typography variant='h4' component='h1' gutterBottom sx={{ marginTop: "2rem" }}>
        Admin Login
      </Typography>
      <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label='Username'
          value={username}
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          margin='normal'
          required
          error={!username}
          helperText='hint: admin'
        />
        <TextField
          label='Password'
          type='password'
          fullWidth
          autoComplete='new-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin='normal'
          required
          error={!password}
          helperText='hint: password'
        />
        {error && (
          <Typography color='error' style={{ marginTop: "10px" }}>
            {error}
          </Typography>
        )}
        <Button
          type='submit'
          fullWidth
          variant='contained'
          color='primary'
          style={{ marginTop: "20px" }}
        >
          Login
        </Button>
        <Button
          variant='outlined'
          color='primary'
          fullWidth
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/register")}
        >
          Register User
        </Button>
      </Box>
    </div>
  );
};

export default LoginAdmin;
