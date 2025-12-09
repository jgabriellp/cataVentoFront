export const compressImage = async (file, maxSizeKB = 70) => {
  const maxSize = maxSizeKB * 1024;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Mantém as dimensões originais
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        let quality = 0.9;

        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob.size <= maxSize || quality < 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: blob.type,
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1; // reduz a qualidade em passos
                compress();
              }
            },
            "image/jpeg",
            quality
          );
        };

        compress();
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
