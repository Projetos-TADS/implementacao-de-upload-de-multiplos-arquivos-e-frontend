import { uploadFile, getImages } from "./modules/api.js";
import {
  showMessage,
  clearMessage,
  updateButtonState,
  renderImagePreview,
  renderGallery,
} from "./modules/ui.js";

const arquivoInput = document.getElementById("arquivoInput");
const enviarBtn = document.getElementById("enviarBtn");
const previewContainer = document.getElementById("previewContainer");

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

async function handleFileUpload() {
  clearMessage();
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
    const result = await uploadFile(files);
    if (result.ok) {
      showMessage(result.data.message, "success");
      loadAndRenderImages();
      arquivoInput.value = "";
      previewContainer.innerHTML = "";
    } else {
      showMessage(result.data.error, "error");
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
    showMessage("Erro de conexão ao buscar imagens.", "error");
  }
}

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

document.addEventListener("DOMContentLoaded", loadAndRenderImages);
