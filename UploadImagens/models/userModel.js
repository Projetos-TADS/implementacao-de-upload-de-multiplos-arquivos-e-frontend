import bcrypt from "bcrypt";

const users = [
  {
    id: 1,
    username: "usuario1",
    email: "usuario1@teste.com",
    passwordHash: "$2b$10$f.Xm/j.VPibTw/c.nvu2Q.fDnn2p7m8.j.B/w.72.1G.xI.1m.g.O",
    role: "admin",
  },
  {
    id: 2,
    username: "usuario2",
    email: "usuario2@teste.com",
    passwordHash: "$2b$10$A.Y.L.i.U.f.x.b.D.i.E.v.A.b.l.o.g.o.I.v.T.j.B.w.72.1G.xI",
    role: "user",
  },
];

export const findByUsername = (username) => {
  return new Promise((resolve, reject) => {
    try {
      const user = users.find((u) => u.username === username);
      resolve(user);
    } catch (error) {
      reject(error);
    }
  });
};

export const createUser = async (username, email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingUser = users.find((u) => u.username === username);
      if (existingUser) {
        reject(new Error("Usuário já existe."));
        return;
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

      const newUser = {
        id: newId,
        username: username,
        email: email,
        passwordHash: passwordHash,
        role: "user",
      };

      users.push(newUser);

      resolve(newUser);
    } catch (error) {
      reject(error);
    }
  });
};
