const generateRoomIdBtn = document.querySelector("#generate-room-id");
const username = document.querySelector("#uname");
const roomIdInput = document.querySelector("#room-id");
generateRoomIdBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const uname = username.value.toLowerCase() || "no_name";
  console.log(uname);
  const roomId = uname + "_" + Date.now() * Math.random() + Date.now();
  roomIdInput.value = roomId;
  console.log(roomId);
});

const copyBtn = document.querySelector("#copy-room-id");
copyBtn.addEventListener("click", (e) => {
  e.preventDefault();

  let id = document.getElementById("room-id");
  console.log(id);
  id.select();
  document.execCommand("copy");
});

setInterval(() => {}, 2000);
