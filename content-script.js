chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download") {
      // Handle download
      downloadScreenshot(request.dataUrl, request.filename);
      
      // Handle clipboard
      copyImageToClipboard(request.dataUrl);
  }
});

async function downloadScreenshot(dataUrl, filename) {
  try {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  } catch (error) {
      console.error('Download failed:', error);
      showPopupBubble("Failed to download screenshot");
  }
}

async function copyImageToClipboard(dataUrl) {
  try {
      // Convert base64 to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create ClipboardItem
      const item = new ClipboardItem({
          'image/png': blob
      });
      
      // Write to clipboard
      await navigator.clipboard.write([item]);
      showPopupBubble("Screenshot copied to clipboard");
  } catch (error) {
      console.error('Clipboard copy failed:', error);
      showPopupBubble("Failed to copy to clipboard");
  }
}

function showPopupBubble(message) {
  const bubble = document.createElement("div");
  bubble.textContent = message;
  Object.assign(bubble.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      padding: "10px 20px",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      borderRadius: "5px",
      zIndex: "2147483647",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
      transition: "opacity 0.3s ease-in-out"
  });
  
  document.body.appendChild(bubble);
  
  // Fade out effect
  setTimeout(() => {
      bubble.style.opacity = "0";
      setTimeout(() => bubble.remove(), 300);
  }, 1700);
}