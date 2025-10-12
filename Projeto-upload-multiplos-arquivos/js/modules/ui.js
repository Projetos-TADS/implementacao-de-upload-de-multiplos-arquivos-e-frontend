const elements = {
  messageBox: document.getElementById("messageBox"),
  enviarBtn: document.getElementById("enviarBtn"),
  previewContainer: document.getElementById("previewContainer"),
  galleryContainer: document.getElementById("galleryContainer"),
};

export function showMessage(message, type) {
  elements.messageBox.textContent = message;
  elements.messageBox.className = `message-box ${type}`;
  elements.messageBox.style.display = "block";
}

export function clearMessage() {
  elements.messageBox.textContent = "";
  elements.messageBox.className = "message-box";
  elements.messageBox.style.display = "none";
}

export function updateButtonState(isLoading, text = "Enviar Imagens") {
  elements.enviarBtn.disabled = isLoading;
  elements.enviarBtn.textContent = isLoading ? "Enviando..." : text;
}

export function renderImagePreview(files) {
  elements.previewContainer.innerHTML = "";

  for (const file of files) {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Pré-visualização";
        img.style.maxWidth = "100px";
        img.style.maxHeight = "100px";
        img.style.borderRadius = "8px";
        img.style.margin = "5px";
        img.style.objectFit = "cover";
        elements.previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  }
}

export function renderGallery(images) {
  elements.galleryContainer.innerHTML = "";

  if (images.length === 0) {
    elements.galleryContainer.innerHTML = "<p>Nenhuma imagem encontrada.</p>";
    return;
  }

  images.forEach((image) => {
    const galleryItem = document.createElement("div");
    galleryItem.className = "gallery-item";

    const img = document.createElement("img");
    img.src = `http://localhost:8080${image.url}`;
    img.alt = image.filename;
    img.loading = "lazy";

    galleryItem.appendChild(img);
    elements.galleryContainer.appendChild(galleryItem);
  });
}
