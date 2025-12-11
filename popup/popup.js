const DEFAULT_STATE = {
    posts: 0,
    comments: 0,
    commentsGoal: 20,
    postsGoal: 4,
    streak: 0,
};

function render(state) {
    document.getElementById('comments').textContent =
        `${state.comments} / ${state.commentsGoal}`;
    document.getElementById('posts').textContent =
        `${state.posts} / ${state.postsGoal}`;
    document.getElementById('streak').textContent = state.streak;

    const commentsPct = Math.min(100, (state.comments / state.commentsGoal) * 100);
    const postsPct = Math.min(100, (state.posts / state.postsGoal) * 100);

    document.getElementById('comments-progress').style.width = `${commentsPct}%`;
    document.getElementById('posts-progress').style.width = `${postsPct}%`;
}

chrome.storage.sync.get(['catalyxCounts'], (result) => {
    const counts = result.catalyxCounts || {};
    const state = {
        ...DEFAULT_STATE,
        comments: counts.comments ?? 0,
        posts: counts.posts ?? 0,
    };
    render(state);
});
