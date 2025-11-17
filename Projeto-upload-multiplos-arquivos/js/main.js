import { uploadFile, getImages, loginUser, registerUser } from "./modules/api.js";
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

  try {
    const result = await registerUser(username, email, password);
    if (result.id) {
      alert("Cadastro realizado com sucesso! Faça login.");
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

async function loadAndRenderImages() {
  try {
    const result = await getImages();
    if (result.success) {
      renderGallery(result.images);
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

document.addEventListener("DOMContentLoaded", checkAuth);
