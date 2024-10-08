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
    const easternTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const timestamp =
      easternTime.getFullYear() +
      "-" +
      String(easternTime.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(easternTime.getDate()).padStart(2, "0") +
      "_" +
      String(easternTime.getHours()).padStart(2, "0") +
      "-" +
      String(easternTime.getMinutes()).padStart(2, "0");
    const filename = `viewport_capture_${timestamp}.png`;

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
