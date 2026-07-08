const { io } = require("socket.io-client");

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5Ac29jaWV0eS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM1MTM2NTcsImV4cCI6MTc4MzUxNDU1N30.lxu3tSbmUpM1N_Jls3XzCyiLpWnmzti5j4cLr5ooCQU";

const socket = io("http://localhost:5000", {
  auth: { token: ACCESS_TOKEN },
});

socket.on("connect", () => {
  console.log("✅ CONNECTED:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ CONNECT ERROR:", err.message);
});