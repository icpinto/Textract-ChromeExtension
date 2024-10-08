chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveText") {
        console.log("Received selected text and URL:", request.text, request.url);

        // Store the selected text and URL in chrome.storage
        chrome.storage.local.set({
            selectedText: request.text,
            pageUrl: request.url
        }, function() {
            console.log("Text and URL have been saved locally.");
        });
    }
});

// Listen for tab changes
chrome.tabs.onActivated.addListener(function(activeInfo) {
    // Invalidate the stored content when the tab changes
    chrome.storage.local.remove(['selectedText', 'pageUrl', 'screenshot'], function() {
        console.log("Stored text and URL have been cleared due to tab change.");
    });
});

// Optional: Listen for when a tab is updated (e.g., URL changes within the same tab)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        // Invalidate the stored content when the tab's URL changes
        chrome.storage.local.remove(['selectedText', 'pageUrl', 'screenshot'], function() {
            console.log("Stored text and URL have been cleared due to URL change.");
        });
    }
});