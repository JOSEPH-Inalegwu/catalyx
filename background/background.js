const RESET_ALARM_NAME = 'catalyx-midnight-reset';

chrome.runtime.onInstalled.addListener(() => {
    console.log('Catalyx installed/updated');
    setupMidnightAlarm();
    checkIfResetNeeded();
});

chrome.runtime.onStartup.addListener(() => {
    console.log('Browser started');
    checkIfResetNeeded();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === RESET_ALARM_NAME) {
        console.log('Midnight alarm triggered');
        performMidnightReset();
    }
});

function setupMidnightAlarm() {
    chrome.alarms.clear(RESET_ALARM_NAME, () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        chrome.alarms.create(RESET_ALARM_NAME, {
            when: Date.now() + msUntilMidnight,
            periodInMinutes: 24 * 60
        });

        console.log(`Midnight alarm set for ${tomorrow.toLocaleString()}`);
    });
}

function checkIfResetNeeded() {
    chrome.storage.sync.get(['catalyxMeta'], (result) => {
        const meta = result.catalyxMeta || {};
        const lastResetDate = meta.lastResetDate;
        const today = getTodayDateString();

        console.log('Last reset:', lastResetDate, 'Today:', today);

        if (lastResetDate !== today) {
            console.log('Reset needed - performing midnight reset');
            performMidnightReset();
        } else {
            console.log('Already reset today');
        }
    });
}

function performMidnightReset() {
    chrome.storage.sync.get(['catalyxCounts', 'catalyxMeta'], (result) => {
        const counts = result.catalyxCounts || {};
        const meta = result.catalyxMeta || {};

        const yesterdayComments = counts.comments || 0;
        const yesterdayPosts = counts.posts || 0;
        const commentsGoal = 10;
        const postsGoal = 5;
        const currentStreak = meta.streak || 0;

        const goalsMet = yesterdayComments >= commentsGoal && yesterdayPosts >= postsGoal;

        let newStreak = 0;
        if (goalsMet) {
            newStreak = currentStreak + 1;
            console.log(`🔥 Goals met! Streak: ${currentStreak} → ${newStreak}`);
        } else {
            newStreak = 0;
            console.log(`❌ Goals missed. Streak reset to 0 (was ${currentStreak})`);
        }

        chrome.storage.sync.set({
            catalyxCounts: {
                comments: 0,
                posts: 0
            },
            catalyxMeta: {
                streak: newStreak,
                todayCelebrated: false,
                lastResetDate: getTodayDateString(),
                lastReset: new Date().toISOString()
            }
        }, () => {
            console.log('✅ Midnight reset complete:', {
                newStreak,
                resetDate: getTodayDateString()
            });
        });
    });
}

function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns "2025-12-11"
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'MANUAL_RESET') {
        console.log('Manual reset triggered');
        performMidnightReset();
        sendResponse({ success: true });
    }
});