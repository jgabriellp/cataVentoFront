import api from "../services/api";

export const deleteFromCloudinary = async (url) => {
  if (!url) return;
  try {
    const FOLDER_NAME = "cata-vento-app";
    const fileName = url.split("/").pop().split(".")[0];
    const publicId = `${FOLDER_NAME}/${fileName}`;
    console.log(publicId);

    const res = await api.delete(`/api/Image`, { data: { publicId } });
    if (res.status === 204) return;

    console.log("Imagem antiga excluída:", publicId);
  } catch (err) {
    console.warn("Falha ao excluir imagem antiga:", err);
  }
};
