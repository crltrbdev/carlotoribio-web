const tokenCountCookieName = 'tokenCount';
const resetTokenDateCookieName = 'restTokenDate';
const maxTokens = 5;
const cookieResetTime = 1000 * 60 * 60;

class CookieManager {
    promoHashtag = process.env.REACT_APP_PROMO_HASHTAG;

    resetChatTokens() {
        this.setCookie(tokenCountCookieName, maxTokens);
        this.setCookie(resetTokenDateCookieName, 0);
    }

    getChatTokens() {
        let tokenCookie = this.getCookie(tokenCountCookieName);
        const secondsToReset = this.getSecondsToReset();
        if (!tokenCookie || secondsToReset <= 0) {
            this.resetChatTokens();
            tokenCookie = this.getCookie(tokenCountCookieName);
        }
        return parseInt(tokenCookie);
    }

    getChatTokensLeftCount() {
        let tokenCookie = this.getCookie(tokenCountCookieName);
        if (tokenCookie) {
            return tokenCookie;
        }
        return 0;
    }

    reduceChatTokens() {
        const chatTokens = parseInt(this.getCookie(tokenCountCookieName));
        if (chatTokens) {
            const date = new Date(Date.now());
            let tokensLeft = chatTokens - 1;
            if (tokensLeft <= 0) {
                tokensLeft = 0;
            }

            this.setCookie(tokenCountCookieName, tokensLeft);
            this.setCookie(resetTokenDateCookieName, date.setMilliseconds(cookieResetTime));

            return tokensLeft;
        }

        return 0;
    }

    setTokenResetTime() {
        this.setCookie(resetTokenDateCookieName, Date.now());
    }

    canAskQuestion() {
        const tokensLeft = 
            this.getChatTokens(tokenCountCookieName);
        const secondsToReset = this.getSecondsToReset();
        return tokensLeft > 0 || secondsToReset <= 0;
    }

    getSecondsToReset() {
        const resetTokenValue = this.getCookie(resetTokenDateCookieName);
        if (resetTokenValue) {
            var secondsToReset = (parseInt(resetTokenValue) - Date.now()) / 1000
            return secondsToReset;
        }
        return 0;
    }

    getTokenResetTime() {
        const resetTokenValue = this.getCookie(resetTokenDateCookieName);
        if (resetTokenValue) {
            return new Date(parseInt(resetTokenValue)).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
        }
        return null;
    }

    getCountdownToTokenReset(showTimeUnit, showSingleUnit) {
        const resetTokenValue = this.getCookie(resetTokenDateCookieName);
        if (resetTokenValue) {
            var milliseconds = parseInt(resetTokenValue) - Date.now();

            if (milliseconds <= 0) {
                return "00:00";
            }

            const minutes = Math.floor(milliseconds / 1000 / 60); // Full minutes
            const seconds = Math.floor((milliseconds / 1000) % 60); // Remaining seconds

            let countdown = "";

            if (showSingleUnit) {
                if (minutes <= 0) {
                    countdown = `${seconds.toString()}${showTimeUnit ? ' ' + this.getTimeUnit(minutes, seconds) : ""}`;
                } else {
                    countdown = `${minutes.toString()}${showTimeUnit ? ' ' + this.getTimeUnit(minutes, seconds) : ""}`;
                }
            } else {
                countdown = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${showTimeUnit ? ' ' + this.getTimeUnit(minutes, seconds) : ""}`;
            }

            return countdown;
        }
        return null;
    }

    getTimeUnit(minutes, seconds) {
        if (minutes > 1) return 'minutes';
        if (minutes === 1) return 'minute';
        if (seconds > 1) return 'seconds';
        if (seconds === 1) return 'second';

        return null; // in case both minutes and seconds are 0
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

    getMaxTokens() {
        return maxTokens;
    }
}

const cookieManager = new CookieManager();
export default cookieManager;