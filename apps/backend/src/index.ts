import app from "@/server";

// Set the port
const PORT = process.env.PORT || 8000;

// Start the server
const startServer = () => {
  try {
    console.log("🔄 Starting backend server...");
    // The server is started in server.ts
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
