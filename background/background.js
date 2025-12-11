chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: '' });
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'COUNTS_UPDATED') {
        const total = (message.posts || 0) + (message.comments || 0);
        if (total > 0) {
            chrome.action.setBadgeBackgroundColor({ color: '#F4212E' });
            chrome.action.setBadgeText({ text: ' ' });
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    }
});
