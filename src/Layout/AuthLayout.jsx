import React from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { Outlet } from "react-router-dom";

function AuthLayout() {
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
      <Typography
        variant="h5"
        fontWeight="bold"
        align="center"
        mb={2}
      ></Typography>
      <Outlet />
    </Box>
  );
}

export default AuthLayout;
