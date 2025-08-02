async function injectContentScript(tabId) {
  try {
    // Check if content script is already injected by trying to send a test message
    try {
      await chrome.tabs.sendMessage(tabId, { action: "ping" });
      // If we get here, content script is already injected
      return;
    } catch (err) {
      // Content script not injected yet, proceed with injection
    }
    
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

    // Get the viewport dimensions
    const [{ result: viewport }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        return {
          width: document.documentElement.clientWidth,
          height: window.innerHeight,
          scrollbarWidth
        };
      }
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
      second: "2-digit",
      hour12: false,
    }).format(now);

    // Format timestamp for filename
    const timestamp = easternTime
      .replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, "$3-$1-$2_$4-$5-$6")
      .replace(/,/g, "");

    const filename = `viewport_capture_${timestamp}.png`;

    // Send to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: "download",
      dataUrl: dataUrl,
      filename: filename,
      viewport: viewport
    });
  } catch (error) {
    console.error("Screenshot capture failed:", error);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveToDownloads") {
        chrome.downloads.download({
            url: request.dataUrl,
            filename: request.filename,
            saveAs: false
        });
    }
});
