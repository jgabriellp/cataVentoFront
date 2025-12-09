import api from "../services/api";
import { compressImage } from "../services/compressImage";

export const uploadToCloudinary = async (file) => {
  let fileToUpload = file;

  if (file.size > 70 * 1024) {
    fileToUpload = await compressImage(file, 70);
  }

  const formData = new FormData();
  formData.append("File", fileToUpload);
  // formData.append("upload_preset", "unsigned_preset");

  const res = await api.post("/api/Image/upload", formData, {
    // Configurar o header para garantir que o Axios não tente
    // serializar o FormData como JSON (415 Unsupported Media Type)
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.imageUrl;
};
