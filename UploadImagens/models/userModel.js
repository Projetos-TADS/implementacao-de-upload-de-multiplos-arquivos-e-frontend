let users = [];
let currentId = 1;

export const findByUsername = (username) => {
  return users.find((user) => user.username === username);
};

export const addUser = (userData) => {
  const newUser = {
    id: currentId++,
    username: userData.username,
    email: userData.email,
    passwordHash: userData.passwordHash,
  };
  users.push(newUser);
  return newUser;
};
