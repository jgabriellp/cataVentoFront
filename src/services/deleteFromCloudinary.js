import api from "../services/api";

export const deleteFromCloudinary = async (url) => {
  if (!url) return;

  const dataToSend = {
    imageUrl: url, // Envia a URL completa para o backend.
  };

  try {
    // const FOLDER_NAME = "cata-vento-app";
    // const fileName = url.split("/").pop().split(".")[0];
    // const publicId = `${FOLDER_NAME}/${fileName}`;
    // console.log(publicId);

    // const res = await api.delete(`/api/Image`, { data: { publicId } });
    // if (res.status === 204) return;
    const res = await api.delete(`/api/Image/delete`, {
      data: dataToSend, // Sintaxe correta do Axios para enviar corpo em DELETE
    });

    if (res.status === 204) {
      console.log("Imagem excluída do Azure:", url);
      return;
    }

    // Se houver um 500 ou outro status de erro, o bloco catch lidará com isso
  } catch (err) {
    // A mensagem de erro do backend será capturada aqui
    console.warn(
      "Falha ao excluir imagem do Azure. Detalhes:",
      err.response ? err.response.data : err.message
    );
  }
};
