const users = [];

let currentId = 1;

const addUser = (user) => {
  const newUser = {
    id: currentId++,
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash,
  };
  users.push(newUser);

  return newUser;
};

const findByUsername = (username) => {
  return users.find((user) => user.username === username);
};

module.exports = {
  addUser,
  findByUsername,
};
