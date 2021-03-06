import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Avatar, Button, Paper, TextField, Typography, Link} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {isAuthorized} from "../utils/common";
import {useDispatch, useSelector} from "react-redux";
import {login as loginAction} from "../actions/user";
import {RootState} from "../types/data";

export const Login = (): JSX.Element => {
	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	const dispatch = useDispatch();
	const login = (username:string, password:string) => dispatch(loginAction(username, password));
	const loginError = useSelector((state:RootState) => state.user.loginError);
	const errorMsg = useSelector((state:RootState) => state.user.errorMsg);

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [passwordErrorText, setPasswordErrorText] = useState("");
	const [promptError, setPromptError] = useState(false);

	// if already login, redirect to homepage
	// use history hook to redirect/navigate between routes
	// component did mount
	useEffect(() => {
		if (isAuthorized()) { history("/");}
		}, []);

	const handleKeyPressed= async (event: React.KeyboardEvent<{}>) => {
		if (event.key === "Enter") { await handleLoginButtonClick();}
	};

	const changeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
	};

	const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
		const password = event.target.value;

		if (password.length <= 6) {
			setPromptError(true);
			setPasswordErrorText("Your password must be at least 6 characters long");
		} else {
			setPromptError(false);
			setPasswordErrorText("");
		}

		setPassword(password);
	};

	 const handleLoginButtonClick = async () => {
		 await login(username, password);
		 if (!loginError) history("/");
	 };

	return (
		<div>
			<div className="center"
				 style={{display: "block", margin: "auto", width: "500px", paddingTop: "10%"}}>
				<Paper style={{padding: 40}}>
					<Avatar style={{margin: "auto"}}>
						<LockOutlinedIcon/>
					</Avatar>
					<Typography component="h1" variant="h5">
						Sign in
					</Typography>
					<Typography style={{color: "red"}}>{errorMsg}</Typography>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						autoFocus
						id="username"
						label="Username"
						name="username"
						value={username}
						onChange={changeUsername}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="password"
						label="Password"
						name="password"
						type="password"
						error={promptError}
						helperText={passwordErrorText}
						value={password}
						onChange={changePassword}
						onKeyPress={handleKeyPressed}
					/>
					<Link href="#" sx={{
						display:"block",
						textAlign:"right",
						margin: "0 auto 10px auto",
						color: "#212529"
					}} target="_blank">Forgot password?</Link>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						onClick={handleLoginButtonClick}
						sx={{
							backgroundColor: "#f7931d",
							color:"#FFFFFF"
						}}
					>Sign In</Button>
					<Link href="/register" sx={{
						fontWeight: 500,
						fontSize:"15px",
						display:"block",
						margin:"10px auto 5px auto",
						color: "#212529"
					}}>Don&apos;t have an account? Sign up.</Link>
				</Paper>
			</div>
		</div>
	);
};
