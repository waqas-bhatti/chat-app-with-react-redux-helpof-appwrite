import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Button,
  TextField,
  Stack,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import authService from "../../apwriteService/auth";
import { userLogout } from "../../ReduxStore/ChatSlice";
import appwriteService from "../../apwriteService/appwriteService";
import { RotatingLines } from "react-loader-spinner";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function AddGroup({ setSelectedUser }) {
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const user = useSelector((state) => state.chat.user);
  const isAuthenticated = useSelector((state) => state.chat.isAuthenticated);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await appwriteService.fetchAllUser();
      // Filter out the logged-in user
      const filteredUsers = fetchedUsers.filter((u) => u.$id !== user.$id);
      // Fetch message count for each user
      const counts = {};
      for (const u of filteredUsers) {
        if (!u.$id || !user.$id) {
          continue; // Skip users with invalid IDs
        }

        const messages = await appwriteService.getMessages(user.$id, u.$id);
        // Filter unread messages based on lastSeenTimestamp
        const lastSeen = localStorage.getItem(`lastSeen_${u.$id}`) || 0;
        const unread = messages.filter(
          (msg) => new Date(msg.timestamp).getTime() > lastSeen
        ).length;

        counts[u.$id] = unread;
      }

      setUsers(filteredUsers);
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize User and Fetch Users
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          await appwriteService.addUser(currentUser.name); // Add user if not exists
        }
        fetchUsers(); // Fetch users after initialization
      } catch (error) {
        console.error("Initialization failed:", error.message);
      }
    };
    // Load selected user from localStorage
    const storedUser = localStorage.getItem("selectedUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setSelectedUser(parsedUser);
        setActiveUser(parsedUser.$id);
      } catch (error) {
        console.error("Failed to parse stored user:", error.message);
      }
    }

    initializeUser();
  }, [user.$id]);

  // fetch the users
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(userLogout());
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error.message);
    }
  };

  const handleUser = (selectedUser) => {
    setSelectedUser(selectedUser); // Use the passed selected user
    setActiveUser(selectedUser.$id);
    localStorage.setItem("selectedUser", JSON.stringify(selectedUser)); // Save correct user data
    // Reset unread count
    localStorage.setItem(`lastSeen_${selectedUser.$id}`, Date.now());
    setUnreadCounts((prev) => ({ ...prev, [selectedUser.$id]: 0 }));
    navigate("/chatroom");
  };

  // Poll for Unread Counts
  useEffect(() => {
    const pollUnreadCounts = async () => {
      const counts = { ...unreadCounts };
      for (const u of users) {
        // Pass both userId and recipientId to getMessages
        const messages = await appwriteService.getMessages(user.$id, u.$id); // <-- Fix here

        // Count only unread messages
        const lastSeen = localStorage.getItem(`lastSeen_${u.$id}`) || 0;
        const unread = messages.filter(
          (msg) => new Date(msg.timestamp).getTime() > lastSeen
        ).length;

        counts[u.$id] = unread; // Update counts
      }
      setUnreadCounts(counts);
    };

    const interval = setInterval(pollUnreadCounts, 2000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [users, unreadCounts, user.$id]); // Make sure to include user.$id in dependency array

  // seach the users

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const results = users.filter((u) =>
        u.userName.toLowerCase().includes(searchUser.toLowerCase())
      );
      setFilteredUsers(results); // Update filtered users dynamically
    }, 100); // Shorter debounce time
    return () => clearTimeout(timeoutId);
  }, [searchUser, users]);

  // select option for logout

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        paddingRight: 4,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ width: "100%", justifyContent: "space-between" }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "#0d47a1", top: "4px" }}>
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </Avatar>
          <Typography variant="h6">
            {user?.name.toUpperCase() || "User"}
          </Typography>
        </Stack>

        <Typography>
          <MoreVertIcon onClick={handleClick} />

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>
              {isAuthenticated ? (
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  sx={{
                    backgroundColor: "#0d47a1",
                    mt: "auto",
                    "&:hover": { backgroundColor: "#0c3c7d" },
                  }}
                >
                  Logout <LogoutIcon />
                </Button>
              ) : (
                <Box>
                  <NavLink to="/login">
                    <Typography>Please Login</Typography>
                  </NavLink>
                </Box>
              )}
            </MenuItem>
          </Menu>
        </Typography>
      </Stack>

      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderTop: "1px solid #ddd",
          marginTop: 3,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          color="warning"
          placeholder="Search User"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          sx={{ my: 2 }}
        />
        <Button
          variant="contained"
          color="success"
          sx={{ height: "50%" }}
          onClick={() => {
            const results = users.filter((u) =>
              u.userName.toLowerCase().includes(searchUser.toLowerCase())
            );
            setFilteredUsers(results); // Update filtered users
          }}
        >
          Search
        </Button>
      </Box>

      <Typography variant="h6" sx={{ borderBottom: 2 }}>
        People
      </Typography>

      {/* Add the Name  */}
      {/* {!isNameAdded && (
        <>
          <TextField
            label="Add User"
            variant="outlined"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<GroupAddIcon />}
            sx={{
              backgroundColor: "#0d47a1",
              "&:hover": { backgroundColor: "#0c3c7d" },
            }}
            onClick={handleAddUser}
          >
            Add Name
          </Button>
        </>
      )} */}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <RotatingLines visible={true} strokeColor="#0d47a1" width="40" />
        </Box>
      ) : (
        <List
          sx={{
            width: "100%",
            mt: 3,
            overflowY: "auto",
            maxHeight: isMobile ? "calc(100vh - 250px)" : "calc(100vh - 150px)",
          }}
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <ListItem
                key={user.$id}
                onClick={() => handleUser(user)}
                sx={{
                  borderBottom: "1px solid #ddd",
                  mb: 1,
                  borderRadius: "8px",
                  backgroundColor:
                    activeUser === user.$id ? "#FF00CC" : "transparent",
                  "&:hover": {
                    backgroundColor: "#000000",
                    cursor: "pointer",
                    color: "#fff",
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "#0d47a1" }}>
                    {user.userName.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText primary={user.userName} />
                  {unreadCounts[user.$id] > 0 && (
                    <Box
                      sx={{
                        backgroundColor: "#25D366",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      {unreadCounts[user.$id]}
                    </Box>
                  )}
                </Stack>
              </ListItem>
            ))
          ) : (
            <Typography>No users available.</Typography>
          )}
        </List>
      )}
    </Box>
  );
}

export default AddGroup;
