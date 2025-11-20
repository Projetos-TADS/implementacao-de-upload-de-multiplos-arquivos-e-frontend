import { uploadFile, getImages, loginUser, registerUser, deleteImage } from "./modules/api.js";
import {
  showMessage,
  clearMessage,
  updateButtonState,
  renderImagePreview,
  renderGallery,
  updateUI,
  toggleAuthForms,
} from "./modules/ui.js";

const arquivoInput = document.getElementById("arquivoInput");
const enviarBtn = document.getElementById("enviarBtn");
const previewContainer = document.getElementById("previewContainer");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const galleryContainer = document.getElementById("galleryContainer");

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function checkAuth() {
  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");
  if (token) {
    updateUI(true, username);
    loadAndRenderImages();
  } else {
    updateUI(false);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const result = await loginUser(username, password);
    if (result.token) {
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("username", result.username || username);
      localStorage.setItem("userRole", result.role);
      checkAuth();
    } else {
      alert(result.message || "Erro no login");
    }
  } catch (error) {
    console.error(error);
    alert("Erro de conexão");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const isAdmin = document.getElementById("regIsAdmin").checked;

  try {
    const result = await registerUser(username, email, password, isAdmin);
    if (result.id) {
      alert(`Cadastro realizado com sucesso! Role: ${result.role}. Faça login.`);
      toggleAuthForms(true);
      registerForm.reset();
    } else {
      alert(result.message || "Erro no cadastro");
    }
  } catch (error) {
    console.error(error);
    alert("Erro de conexão");
  }
}

function handleLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  localStorage.removeItem("userRole");
  checkAuth();
}

async function handleFileUpload() {
  clearMessage();
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Você precisa estar logado para enviar arquivos.");
    handleLogout();
    return;
  }

  const files = arquivoInput.files;

  if (files.length === 0) {
    showMessage("Nenhum arquivo selecionado.", "alert");
    return;
  }

  if (files.length > MAX_FILES) {
    showMessage(`Erro: Selecione no máximo ${MAX_FILES} arquivos.`, "error");
    return;
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showMessage(`Erro: O arquivo "${file.name}" excede o limite de 5MB.`, "error");
      return;
    }
  }

  updateButtonState(true);

  try {
    const result = await uploadFile(files, token);

    if (result.ok) {
      showMessage(result.data.message, "success");
      loadAndRenderImages();
      arquivoInput.value = "";
      previewContainer.innerHTML = "";
    } else {
      if (result.status === 401 || result.status === 403) {
        showMessage("Sessão expirada. Faça login novamente.", "error");
        handleLogout();
      } else {
        showMessage(result.data.error || "Erro ao enviar", "error");
      }
    }
  } catch (error) {
    console.error("Erro de requisição:", error);
    showMessage("Erro de conexão com o servidor.", "error");
  } finally {
    updateButtonState(false);
  }
}

async function handleDeleteImage(filename) {
  if (!confirm(`Tem certeza que deseja excluir a imagem "${filename}"?`)) return;

  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Você precisa estar logado.");
    return;
  }

  try {
    const result = await deleteImage(filename, token);
    if (result.ok) {
      alert("Imagem excluída com sucesso!");
      loadAndRenderImages();
    } else {
      alert(result.data.message || "Erro ao excluir imagem.");
    }
  } catch (error) {
    console.error("Erro ao excluir:", error);
    alert("Erro de conexão.");
  }
}

async function loadAndRenderImages() {
  try {
    const result = await getImages();
    const userRole = localStorage.getItem("userRole");

    if (result.success) {
      renderGallery(result.images, userRole);
    } else {
      showMessage("Não foi possível carregar as imagens.", "error");
    }
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
  }
}

loginForm.addEventListener("submit", handleLogin);
registerForm.addEventListener("submit", handleRegister);
logoutBtn.addEventListener("click", handleLogout);
showRegisterBtn.addEventListener("click", () => toggleAuthForms(false));
showLoginBtn.addEventListener("click", () => toggleAuthForms(true));
enviarBtn.addEventListener("click", handleFileUpload);

arquivoInput.addEventListener("change", () => {
  clearMessage();
  const files = arquivoInput.files;
  if (files.length > 0) {
    renderImagePreview(files);
  } else {
    previewContainer.innerHTML = "";
  }
});

if (galleryContainer) {
  galleryContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const filename = e.target.dataset.filename;
      handleDeleteImage(filename);
    }
  });
}

document.addEventListener("DOMContentLoaded", checkAuth);
