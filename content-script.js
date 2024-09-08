chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download") {
    const link = document.createElement("a");
    link.href = request.dataUrl;
    link.download = request.filename;
    link.click();
  }
});
