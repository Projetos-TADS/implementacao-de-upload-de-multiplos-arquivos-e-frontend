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

export async function findByUsername(username) {
  return users.find((user) => user.username === username);
}

export async function createUser(username, email, password, role = "user") {
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    throw new Error("Usuário já existe.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    username,
    email,
    passwordHash,
    role,
  };

  users.push(newUser);
  return newUser;
}
