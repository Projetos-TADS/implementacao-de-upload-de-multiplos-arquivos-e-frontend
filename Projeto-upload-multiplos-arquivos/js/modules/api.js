const API_URL = "http://localhost:8080/api";

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

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
