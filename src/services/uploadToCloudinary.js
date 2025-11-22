import api from "../services/api";

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_preset");

  const res = await api.post("/api/Image", formData, {
    // Configurar o header para garantir que o Axios não tente
    // serializar o FormData como JSON (415 Unsupported Media Type)
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.secureUrl;
};
