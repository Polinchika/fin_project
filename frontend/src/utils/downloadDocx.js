export const downloadDocx = async (resultId) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`/api/results/${resultId}/text_document`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    alert("Ошибка при формировании документа");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ocr_result.docx";
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
};
