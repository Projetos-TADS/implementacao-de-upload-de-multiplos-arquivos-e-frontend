const API_URL = "http://localhost:8080/api";

export async function uploadFile(files) {
  const formData = new FormData();

  for (const file of files) {
    formData.append("meusArquivos", file);
  }

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
