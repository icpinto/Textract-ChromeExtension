document.addEventListener('mouseup', function () {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        // Get the current page's URL
        let pageUrl = window.location.href;

        // Send the selected text and the URL to the background script
        chrome.runtime.sendMessage({ action: "saveText", text: selectedText, url: pageUrl });
    }
});
