const users = [];

const userJoin = (id, username, room) => {
  const user = {
    id,
    username,
    room,
  };
  users.push(user);
  return user;
};

const getCurrentUser = (id) => {
  return users.find((user) => user.id === id);
};

const userLeave = (id) => {
  let userIndex = users.findIndex((user) => user.id === id);
  if (userIndex != -1) {
    return users.splice(userIndex, 1)[0];
  }
};

const getAllUsers = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = { userJoin, getCurrentUser, userLeave, getAllUsers };
