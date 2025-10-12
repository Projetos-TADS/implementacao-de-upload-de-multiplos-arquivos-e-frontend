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

async function handleFileUpload() {
  clearMessage();
  const file = arquivoInput.files[0];

  if (!file) {
    showMessage("Nenhum arquivo selecionado.", "alert");
    return;
  }

  updateButtonState(true);

  try {
    const result = await uploadFile(file);
    if (result.ok) {
      showMessage(result.data.message, "success");
      loadAndRenderImages();
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
  renderImagePreview(arquivoInput.files[0]);
});

document.addEventListener("DOMContentLoaded", loadAndRenderImages);
