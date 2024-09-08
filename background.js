// background.js
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.startsWith("chrome://")) {
    chrome.action.setTitle({
      tabId: tab.id,
      title: "Cannot screenshot chrome:// pages",
    });
    return;
  }

  chrome.tabs.captureVisibleTab(null, {}, (dataUrl) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    // Generate timestamp
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace("T", "_");
    const filename = `viewport_screenshot_${timestamp}.png`;

    // Inject and execute content script
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        function: downloadScreenshot,
        args: [dataUrl, filename],
      })
      .then(() => {
        chrome.action.setTitle({ tabId: tab.id, title: "Screenshot saved" });
      })
      .catch((error) => {
        console.error("Error executing script: ", error);
        chrome.action.setTitle({
          tabId: tab.id,
          title: "Error saving screenshot",
        });
      });
  });
});

function downloadScreenshot(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
