document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['selectedText', 'pageUrl', 'screenshot'], function(data) {
        if (data.selectedText) {
            document.getElementById('textArea').value = data.selectedText;
        } else {
            document.getElementById('textArea').value = "";
        }
        if (data.pageUrl) {
            document.getElementById('urlInput').value = data.pageUrl;
        } else {
            document.getElementById('urlInput').value = "";
        }
        if (data.screenshot) {
            document.getElementById('screenshot').src = data.screenshot;
        } else {
            document.getElementById('screenshot').src = "";
        }


        const categorySelect = document.getElementById('categorySelect');
        const categoryInput = document.getElementById('categoryInput');

        // Populate the category dropdown from chrome.storage.local
        chrome.storage.local.get(['userCategories'], function (data) {
            let categories = data.userCategories || [];
            populateCategoryDropdown(categories);
        });

        // Add new category to chrome.storage.local and MongoDB
        categoryInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const newCategory = categoryInput.value.trim();
                console.log(newCategory);
                if (newCategory) {
                    chrome.storage.local.get(['userCategories'], function (data) {
                        let categories = data.userCategories || [];

                        // Check if the category already exists
                        if (!categories.includes(newCategory)) {
                            categories.push(newCategory);

                            // Save the updated categories to chrome.storage.local
                            chrome.storage.local.set({ 'userCategories': categories }, function () {
                                console.log('Category added locally.');
                                populateCategoryDropdown(categories);
                            });

                            // Save the new category to MongoDB
                            saveCategoryToMongoDB(newCategory);
                        } else {
                            alert('Category already exists.');
                        }
                    });
                    categoryInput.value = ''; // Clear input field
                }
            }
        });

        function populateCategoryDropdown(categories) {
            categorySelect.innerHTML = ''; // Clear existing options
    
            // Add a placeholder option
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = 'Select a category';
            categorySelect.appendChild(placeholderOption);
    
            // Add all categories to the dropdown
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }

        // Function to save new category to MongoDB
        function saveCategoryToMongoDB(category) {
            fetch('http://localhost:3001/addCategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'user123',
                    newCategory: category
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Category saved to MongoDB:', data);
            })
            .catch(error => {
                console.error('Error saving category to MongoDB:', error);
            });
        }
    
    });

    document.getElementById('saveButton').addEventListener('click', function () {
        const textArea = document.getElementById('textArea').value;
        const urlInput = document.getElementById('urlInput').value;
        const category = document.getElementById('categorySelect').value || "Uncategorized";
        const screenshot = document.getElementById('screenshot').src;
        

        fetch('http://localhost:3001/saveText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: textArea,
                url: urlInput,
                category: category,
                screenshot: screenshot
            })
        })
        .then(response => response.text())
        .then(data => {
            alert("Text and URL saved successfully");
        })
        .catch(error => {
            console.error("Error saving text and URL:", error);
            alert('Failed to save text and URL');
        });
    });

    // Handle screenshot capture
    document.getElementById('captureScreenshotButton').addEventListener('click', function() {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, function(dataUrl) {
            if (chrome.runtime.lastError) {
                console.error("Failed to capture screenshot:", chrome.runtime.lastError.message);
                return;
            }

            // Display the screenshot in the popup
            document.getElementById('screenshot').src = dataUrl;

            // Store the screenshot in chrome.storage
            chrome.storage.local.set({ screenshot: dataUrl }, function() {
                console.log("Screenshot saved.");
            });
        });
    });
});

