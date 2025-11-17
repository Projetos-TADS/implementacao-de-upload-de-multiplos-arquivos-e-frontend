const API_URL = "http://localhost:3001";

export async function loginUser(username, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function registerUser(username, email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return response.json();
}

export async function uploadFile(files, token) {
  const formData = new FormData();

  for (const file of files) {
    formData.append("meusArquivos", file);
  }

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    return { ok: false, status: response.status, data: { error: "Sessão expirada." } };
  }

  const data = await response.json();

  return {
    ok: response.ok,
    data,
  };
}

export async function getImages() {
  const response = await fetch(`${API_URL}/images`);
  const data = await response.json();
  return data;
}
