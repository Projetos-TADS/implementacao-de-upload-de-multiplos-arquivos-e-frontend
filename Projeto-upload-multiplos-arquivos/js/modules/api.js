const API_URL = "http://localhost:3001";

export async function loginUser(username, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function registerUser(username, email, password, isAdmin) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, isAdmin }),
  });
  return response.json();
}

export async function uploadFile(files, token) {
  const formData = new FormData();

  for (const file of files) {
    formData.append("meusArquivos", file);
  }

  const response = await fetch(`${API_URL}/file/upload`, {
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
  const response = await fetch(`${API_URL}/file/images`);
  const data = await response.json();
  return data;
}

export async function deleteImage(filename, token) {
  const response = await fetch(`${API_URL}/file/delete/${filename}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response.status !== 204 ? await response.json() : {};

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
