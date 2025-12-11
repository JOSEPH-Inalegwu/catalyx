console.log('Catalyx content script loaded on this page.');

let postCount = 0;
let commentCount = 0;

chrome.storage.sync.get(['catalyxCounts'], (result) => {
    const counts = result.catalyxCounts || {};
    postCount = counts.posts ?? 0;
    commentCount = counts.comments ?? 0;
});

function getComposerText() {
    const composer = document.querySelector('div[role="textbox"][data-testid="tweetTextarea_0"]');
    return composer?.innerText?.trim() || '';
}

function saveCounts() {
    chrome.storage.sync.set({
        catalyxCounts: {
            posts: postCount,
            comments: commentCount,
        },
    });
}

function attachPostListener() {
    const postButton = document.querySelector('button[data-testid="tweetButton"]');
    if (!postButton || postButton.dataset.catalyxAttached === 'true') return;

    postButton.dataset.catalyxAttached = 'true';

    postButton.addEventListener('click', () => {
        const text = getComposerText();
        postCount += 1;
        saveCounts();
        console.log('[Catalyx] NEW POST:', text);
        console.log('[Catalyx] Post count today:', postCount);
    });
}

function attachReplyListener() {
    const replyButtons = document.querySelectorAll('button[data-testid="tweetButtonInline"]');

    replyButtons.forEach((btn) => {
        if (btn.dataset.catalyxAttached === 'true') return;
        btn.dataset.catalyxAttached = 'true';

        btn.addEventListener('click', () => {
            const text = getComposerText();
            commentCount += 1;
            saveCounts();
            console.log('[Catalyx] REPLY:', text);
            console.log('[Catalyx] Comment count this session:', commentCount);
        });
    });
}

const observer = new MutationObserver(() => {
    attachPostListener();
    attachReplyListener();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// Initial run
attachPostListener();
attachReplyListener();
