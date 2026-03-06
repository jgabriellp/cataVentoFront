const renderContentWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) =>
    urlRegex.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#04b1b7",
          fontWeight: "600",
          textDecoration: "underline",
          wordBreak: "break-all",
        }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};

export default renderContentWithLinks;
