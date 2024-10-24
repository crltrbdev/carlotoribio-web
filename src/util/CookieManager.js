const tokenCookieName = 'tokenCount';
const resetTokenDateCookieName = 'restTokenDate';

const maxTokens = 3;
const cookieResetTime = 1000 * 60 * 60; // 1 hour
// const cookieResetTime = 1000 * 60 * 2; // 2 minutes
// const cookieResetTime = 1000 * 60; // 1 minute
// const cookieResetTime = 1000 * 30; // 30 seconds
// const cookieResetTime = 1000 * 15; // 15 seconds
// const cookieResetTime = 5000; // 5 seconds

class CookieManager {

    resetChatTokens() {
        this.setCookie(tokenCookieName, maxTokens);
        this.setCookie(resetTokenDateCookieName, 0);
    }

    getChatTokens() {
        let tokenCookie = this.getCookie(tokenCookieName);
        if (!tokenCookie || this.getSecondsToReset() <= 0) {
            this.resetChatTokens();
            tokenCookie = this.getCookie(tokenCookieName);
        }
        return parseInt(tokenCookie);
    }

    reduceChatTokens() {
        const chatTokens = parseInt(this.getCookie(tokenCookieName));
        if (chatTokens) {
            const date = new Date(Date.now());
            let tokensLeft = chatTokens - 1;
            if(tokensLeft <= 0) {
                tokensLeft = 0;
            }

            this.setCookie(tokenCookieName, tokensLeft);
            this.setCookie(resetTokenDateCookieName, date.setMilliseconds(cookieResetTime));

            return tokensLeft;
        }

        return 0;
    }

    setTokenResetTime() {
        this.setCookie(resetTokenDateCookieName, Date.now());
    }

    canAskQuestion() {
        return true || this.getCookie(tokenCookieName) > 0 || this.getSecondsToReset() <= 0;
    }

    getSecondsToReset() {
        const resetTokenValue = this.getCookie(resetTokenDateCookieName);
        if(resetTokenValue) {
            var secondsToReset = (parseInt(resetTokenValue) - Date.now()) / 1000
            return secondsToReset;
        }
        return 0;
    }

    getTokenResetTime() {
        const resetTokenValue = this.getCookie(resetTokenDateCookieName);
        if(resetTokenValue) {
            return new Date(parseInt(resetTokenValue)).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
        }
        return null;
    }

    getCountdownToTokenReset() {
        const resetTokenValue = this.getCookie(resetTokenDateCookieName);
        if(resetTokenValue) {
            var milliseconds = parseInt(resetTokenValue) - Date.now();

            if(milliseconds <= 0)
            {
                return "00:00";
            }

            const minutes = Math.floor(milliseconds / 1000 / 60); // Full minutes
            const seconds = Math.floor((milliseconds / 1000) % 60); // Remaining seconds

            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return null;
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    setCookie(name, value) {
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    }
}

const cookieManager = new CookieManager();
export default cookieManager;