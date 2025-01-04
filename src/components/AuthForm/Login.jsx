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
import { NavLink } from "react-router-dom";
import talko from "../image/talko.webp";
import authervice from "../../apwriteService/auth";
import { userLogin } from "../../ReduxStore/ChatSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let isValid = true;
    let errors = {};

    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!data.password || data.password.length < 5) {
      errors.password = "Password must be at least 5 characters long";
      isValid = false;
    }

    setError(errors);
    return isValid;
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate Inputs
    if (!validate()) return;
    setLoading(true);
    try {
      // 1. Check if a session already exists
      const currentUser = await authervice.getCurrentUser();
      if (currentUser) {
        console.log("User is already logged in:", currentUser);
        dispatch(userLogin({ user: { ...currentUser } }));
        navigate("/chatroom");
        return;
      }
    } catch (err) {
      console.warn("No active session found. Proceeding with login.");
      setError({ general: error.message });
    } finally {
      setLoading(false);
    }

    try {
      // 2. Attempt login if no session exists
      const session = await authervice.login(data.email, data.password);
      if (session) {
        const userData = await authervice.getCurrentUser();
        dispatch(userLogin({ user: { ...userData } })); // Update Redux
        navigate("/chatroom"); // Redirect to chatroom
        console.log("Login successful:", userData);
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      setError({ general: error.message }); // Display error message
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      await authervice.googleAuth();

      const currentUser = await authervice.getCurrentUser();

      if (currentUser) {
        console.log("Successfully logged in with Google:", currentUser);
        dispatch(userLogin({ user: { ...currentUser } }));
        navigate("/chatroom"); // Navigate to chatroom page
      } else {
        setError({ general: "Google login failed. Please try again." });
      }
    } catch (error) {
      console.error("Google login error:", error.message);
      setError({ general: "Google login failed. Please try again." });
    } finally {
      setLoading(false);
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
      {/* Main Container for the image and form */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          maxWidth: "1200px",
          gap: 2,
        }}
      >
        {/* Image Section (Left Side) */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          <Box
            component="img"
            src={talko}
            alt="Talko"
            sx={{
              width: "100%",
              height: "100%",
              maxHeight: "600px",
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        </Box>

        {/* Form Section (Right Side) */}
        <Box
          sx={{
            width: { xs: "100%", sm: "400px" }, // Form width
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 4,
            boxShadow: 3,
            height: "auto",
            overflowY: "visible",
          }}
        >
          {error.general && (
            <Typography color="error" align="center">
              {error.general}
            </Typography>
          )}
          <Typography variant="h5" fontWeight="bold" align="center" mb={2}>
            Login
          </Typography>

          {/* Form */}
          <Box
            component="form"
            noValidate
            sx={{ width: "100%" }}
            onSubmit={handleLogin}
          >
            <TextField
              fullWidth
              label="Email Address"
              name="email" // ✅ Added name
              margin="normal"
              required
              variant="outlined"
              value={data.email || ""}
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
              value={data.password || ""}
              onChange={handleChange}
            />

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                mt: 2,
                mb: 2,
                borderRadius: 50,
                padding: "10px 0",
              }}
            >
              Login
            </Button>

            {/* Divider */}
            <Divider sx={{ mb: 2 }}>OR</Divider>

            {/* Google Login */}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <RotatingLines
                  visible={true}
                  strokeColor="#0d47a1"
                  width="40"
                />
              </Box>
            )}
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
                onClick={handleGoogleLogin}
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
              Don't have an account?{" "}
              <NavLink to="/sign-up">
                <Button size="small">Sign Up</Button>
              </NavLink>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
