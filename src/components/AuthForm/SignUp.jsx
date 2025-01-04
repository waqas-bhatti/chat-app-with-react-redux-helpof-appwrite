import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Paper,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import authervice from "../../apwriteService/auth";

function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState({});
  const [data, setData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { email, password, fullName } = data;
    try {
      await authervice.createAccount(email, password, fullName);
      navigate("/login");
      console.log("sucessfully signup");
    } catch (error) {
      setError({ signup: error.message });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          width: { xs: "90%", sm: "400px" },
          borderRadius: 4,
        }}
      >
        {/* Title */}
        <Typography variant="h5" fontWeight="bold" align="center" mb={2}>
          Sign Up
        </Typography>

        {/* Form */}
        <Box component="form" noValidate onSubmit={handleSignUp}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName" // ✅ Added name
            margin="normal"
            required
            variant="outlined"
            value={data.fullName} // ✅ Link to state
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Email Address"
            name="email" // ✅ Added name
            margin="normal"
            required
            variant="outlined"
            value={data.email} // ✅ Link to state
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password" // ✅ Added name
            margin="normal"
            required
            variant="outlined"
            value={data.password} // ✅ Link to state
            onChange={handleChange}
          />

          {/* Submit Button */}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2, mb: 2 }}
          >
            Sign Up
          </Button>

          {/* Divider */}
          <Divider sx={{ mb: 2 }}>OR</Divider>

          {/* Google Login */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px",
                borderRadius: 50, // Circular button style
                backgroundColor: "#db4437", // Google red color
                "&:hover": {
                  backgroundColor: "#c13529", // Darker shade on hover
                },
              }}
            >
              <GoogleIcon sx={{ mr: 1 }} /> {/* Icon with right margin */}
              <Typography variant="body2">Login with Google</Typography>
            </Button>
          </Box>

          {/* Footer Text */}
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Button href="/login" size="small">
              Login
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default SignUp;
