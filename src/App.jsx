import "./App.css";
import ChatRoom from "./components/chatroom/ChatRoom";
import { Container, Box, Typography, ThemeProvider } from "@mui/material";

function App() {
  return (
    <>
      <Box>
        <Typography>
          <h1>Chat App</h1>
          <ChatRoom />
        </Typography>
      </Box>
    </>
  );
}

export default App;
