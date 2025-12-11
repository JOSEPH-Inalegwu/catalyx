const DEFAULT_STATE = {
    posts: 0,
    comments: 0,
    commentsGoal: 10,
    postsGoal: 5,
    streak: 0,
    todayCelebrated: false,
};

let confettiInstance = null;

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

    const allDone =
        state.comments >= state.commentsGoal &&
        state.posts >= state.postsGoal;

    document.getElementById('today-status').textContent =
        allDone ? 'Today: done 🎯' : 'Today: in progress';
}

function celebrateIfNeeded(state) {
    const allDone =
        state.comments >= state.commentsGoal &&
        state.posts >= state.postsGoal;

    if (allDone && !state.todayCelebrated) {
        if (!confettiInstance) {
            confettiInstance = new window.ConfettiGenerator({
                target: 'catalyx-confetti',
                max: 80,
                size: 1,
                animate: true,
                props: ['circle', 'square'],
                colors: [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]],
                clock: 25,
                rotate: true
            });
        }

        confettiInstance.render();

        setTimeout(() => {
            if (confettiInstance) {
                confettiInstance.clear();
            }
        }, 3000);

        chrome.storage.sync.set({
            catalyxMeta: { todayCelebrated: true },
        });
    }
}

chrome.storage.sync.get(['catalyxCounts', 'catalyxMeta'], (result) => {
    const counts = result.catalyxCounts || {};
    const meta = result.catalyxMeta || {};
    const state = {
        ...DEFAULT_STATE,
        comments: counts.comments ?? 0,
        posts: counts.posts ?? 0,
        todayCelebrated: meta.todayCelebrated ?? false,
    };

    render(state);

    setTimeout(() => {
        celebrateIfNeeded(state);
    }, 100);
});