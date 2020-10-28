//class functions
class UI {
  static roomInfo(message) {
    const li = document.createElement("li");
    li.innerText = message;
    li.classList.add("user-info-room-item");
    document.querySelector(".user-info-room-list").appendChild(li);
    setTimeout(() => {
      UI.removeEl(li);
    }, 4000);
  }

  static createChat(username, message) {
    const chatContainer = document.querySelector(".chat-list");
    const li = document.createElement("li");
    li.classList.add("chat-item");
    const h4 = document.createElement("h4");
    h4.classList.add("chat-username");
    h4.innerText = username;
    const p = document.createElement("p");
    p.classList.add("chat-text");
    p.innerText = message;

    li.appendChild(h4);
    li.appendChild(p);
    chatContainer.appendChild(li);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  static removeEl(el) {
    el.remove();
  }
}

// socket operation
const socket = io();

const { uname, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("joinUsers", {
  uname,
  room,
});

// user join and left info
socket.on("userRoomMsg", (message) => {
  console.log(message);
  UI.roomInfo(message);
});

// on sending chat message
const form = document.querySelector("#chat-form");
console.log(form);
document.querySelector("#chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.querySelector("#chat-input");
  socket.emit("chatMessage", message.value);
  message.value = "";
  message.focus();
});

// on receiving chat message
socket.on("chatMessage", ({ username, message }) => {
  UI.createChat(username, message);
  console.log(message);
});
