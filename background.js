async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content-script.js"],
    });
  } catch (err) {
    console.error("Failed to inject content script:", err);
    throw err;
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check for restricted pages
    if (
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://")
    ) {
      chrome.action.setTitle({
        tabId: tab.id,
        title: "Cannot screenshot this page type",
      });
      return;
    }

    // Inject content script first
    await injectContentScript(tab.id);

    // Capture screenshot
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: "png",
      quality: 100,
    });

    // Generate timestamp in ET
    const now = new Date();
    const easternTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);

    // Format timestamp for filename
    const timestamp = easternTime
      .replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+)/, "$3-$1-$2_$4-$5")
      .replace(/,/g, "");

    const filename = `viewport_capture_${timestamp}.png`;

    // Send to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: "download",
      dataUrl: dataUrl,
      filename: filename,
    });
  } catch (error) {
    console.error("Screenshot capture failed:", error);
  }
});
