const elements = {
  messageBox: document.getElementById("messageBox"),
  enviarBtn: document.getElementById("enviarBtn"),
  previewContainer: document.getElementById("previewContainer"),
  galleryContainer: document.getElementById("galleryContainer"),
  authSection: document.getElementById("authSection"),
  appSection: document.getElementById("appSection"),
  loginContainer: document.getElementById("loginContainer"),
  registerContainer: document.getElementById("registerContainer"),
  userDisplay: document.getElementById("userDisplay"),
};

export function showMessage(message, type) {
  if (!elements.messageBox) return alert(message);
  elements.messageBox.textContent = message;
  elements.messageBox.className = `message-box ${type}`;
  elements.messageBox.style.display = "block";
}

export function clearMessage() {
  if (!elements.messageBox) return;
  elements.messageBox.textContent = "";
  elements.messageBox.className = "message-box";
  elements.messageBox.style.display = "none";
}

export function updateButtonState(isLoading, text = "Enviar Imagens") {
  if (!elements.enviarBtn) return;
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

export function renderGallery(images, userRole) {
  elements.galleryContainer.innerHTML = "";

  if (!images || images.length === 0) {
    elements.galleryContainer.innerHTML = "<p>Nenhuma imagem encontrada.</p>";
    return;
  }

  images.forEach((image) => {
    const galleryItem = document.createElement("div");
    galleryItem.className = "gallery-item";
    galleryItem.style.position = "relative";

    const img = document.createElement("img");
    img.src = `http://localhost:3001${image.url}`;
    img.alt = image.filename;
    img.loading = "lazy";

    galleryItem.appendChild(img);

    if (userRole === "admin") {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "X";
      deleteBtn.className = "btn-delete";
      deleteBtn.dataset.filename = image.filename;

      deleteBtn.style.position = "absolute";
      deleteBtn.style.top = "5px";
      deleteBtn.style.right = "5px";
      deleteBtn.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
      deleteBtn.style.color = "white";
      deleteBtn.style.border = "none";
      deleteBtn.style.borderRadius = "50%";
      deleteBtn.style.width = "25px";
      deleteBtn.style.height = "25px";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.style.fontWeight = "bold";
      deleteBtn.title = "Excluir imagem";

      galleryItem.appendChild(deleteBtn);
    }

    elements.galleryContainer.appendChild(galleryItem);
  });
}

export function updateUI(isLoggedIn, username = "") {
  if (isLoggedIn) {
    elements.authSection.classList.add("hidden");
    elements.appSection.classList.remove("hidden");
    elements.userDisplay.textContent = username;
  } else {
    elements.authSection.classList.remove("hidden");
    elements.appSection.classList.add("hidden");
    elements.loginContainer.classList.remove("hidden");
    elements.registerContainer.classList.add("hidden");
  }
}

export function toggleAuthForms(showLogin) {
  if (showLogin) {
    elements.loginContainer.classList.remove("hidden");
    elements.registerContainer.classList.add("hidden");
  } else {
    elements.loginContainer.classList.add("hidden");
    elements.registerContainer.classList.remove("hidden");
  }
}
