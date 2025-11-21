export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_preset");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dnxt4nqp3/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message || "Erro no upload da imagem");

  return data.secure_url;
};
