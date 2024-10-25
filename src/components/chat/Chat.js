import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaArrowUp, FaBan, FaCaretLeft, FaCaretRight, FaPaperPlane } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';

import OpenAIService from '../../services/OpenAIService';

import ChatItem from '../chat-item/ChatItem';
import SkillItem from '../skill-item/SkillItem';

import './Chat.scss';
import cookieManager from '../../util/CookieManager';

function Chat() {
    const NO_TOKENS_PROMPT = process.env.REACT_APP_NO_TOKENS_PROMPT;
    const GREETING_PROMPT = process.env.REACT_APP_GREETING_PROMPT;
    const RESUME_LINK = process.env.REACT_APP_RESUME_LINK;

    const [query, setQuery] = useState("");

    const [showNewAnswer, setShowNewAnswer] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const [scrollThresholdDirection, setScrollThresholdDirection] = useState('none');
    const [chatItems, setChatItems] = useState([]);
    const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

    const inputRef = useRef(null);
    const scrollDivRef = useRef(null);
    const ulScrollRef = useRef(null);

    const greeting = useMemo(() => GREETING_PROMPT
        .replace('{0}', RESUME_LINK), [GREETING_PROMPT, RESUME_LINK]);

    useEffect(() => {
        const greetingChatItem = {
            chatId: uuidv4(),
            itemType: 'streamAnswer',
            streamFunction: async (chatItemData) => {
                chatItemData.setIsStreaming(true);
                setIsWaitingForAnswer(true);

                const words = greeting.split(' ');
                let currentAnswer = '';

                words.forEach((word, index) => {
                    setTimeout(() => {
                        currentAnswer += (currentAnswer ? ' ' : '') + word;
                        chatItemData.setAnswer(currentAnswer);

                        if (index === words.length - 1) {
                            onStreamComplete();
                        }
                    }, index * 50);
                });

                function onStreamComplete() {
                    chatItemData.setIsStreaming(false);
                    setIsWaitingForAnswer(false);
                }
            }
    };

    setChatItems([greetingChatItem]);
    setChatHistory(old => [...old, `[assistant] ${greeting}`]);
}, [greeting]);

useEffect(() => {
    setShowNewAnswer(scrollDivRef.current.scrollTop >= 5)
}, [chatItems]);

function scrollToTop() {
    scrollDivRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    setShowNewAnswer(false);
}

function handleSkillClick(event) {
    setQuery(event);
    inputRef.current.focus();
}

function handleChange(event) {
    setQuery(event.target.value);
}

function handlePromptSuggestionClick(event) {
    setQuery(event.target.textContent);
    inputRef.current.focus();
}

async function handleGetCompletion(event) {
    const canAsk = cookieManager.canAskQuestion();

    if (query === "" || isWaitingForAnswer) {
        return;
    }

    if (!canAsk) {
        if (event.key === "Enter" || event.type === 'click') {
            const bypass = query.includes(cookieManager.promoHashtag);
            if (!bypass) {
                handleTokensDepleted();
                return;
            }
        }
    }

    if (event.key === 'Enter' || event.type === 'click') {
        setIsWaitingForAnswer(true);

        cookieManager.reduceChatTokens();

        const queryChatItem = {
            chatId: uuidv4(),
            itemType: 'query',
            prompt: query
        };

        setChatItems(old => [...old, queryChatItem]);

        setQuery('');

        setChatHistory(old => [...old, `[user] ${query}`]);

        const streamFunction = async (chatItemData) => {
            try {
                chatItemData.setIsStreaming(true);

                const decoder = new TextDecoder("utf-8");
                let answer = '';

                const lambdaResponse = await OpenAIService
                    .streamAnswer(
                        query,
                        chatHistory);

                
                for await (const event of lambdaResponse.EventStream) {
                    const text = decoder.decode(event.PayloadChunk?.Payload);
                    if (chatItemData.setAnswer) {
                        answer += text;
                        chatItemData.setAnswer(answer);
                    }
                }

                setIsWaitingForAnswer(false);
                chatItemData.setIsStreaming(false);

                return answer;
            }
            catch (error) {
                console.error(error);
            }
            finally {
                setIsWaitingForAnswer(false);
                chatItemData.setIsStreaming(false);
            }
        };

        const streamChatItem = {
            chatId: uuidv4(),
            itemType: 'streamAnswer',
            streamFunction
        }

        setChatItems(old => [...old, streamChatItem]);
    }
}

function handleTokensDepleted() {
    setIsWaitingForAnswer(true);

    const queryChatItem = {
        chatId: uuidv4(),
        itemType: 'query',
        prompt: query
    };

    setChatHistory(old => [...old, `[user] ${query}`]);

    setQuery('');
    setChatItems(old => [...old, queryChatItem]);

    const countdown = cookieManager.getCountdownToTokenReset(true, true);

    let answer = NO_TOKENS_PROMPT
        .replace('{0}', cookieManager.getMaxTokens())
        .replace('{1}', RESUME_LINK)
        .replace('{2}', countdown);

    const fakeStreamFunction = async (chatItemData) => {
        chatItemData.setIsStreaming(true);
        // setIsWaitingForAnswer(true);

        const words = answer.split(' ');
        let currentAnswer = '';

        words.forEach((word, index) => {
            setTimeout(() => {
                currentAnswer += (currentAnswer ? ' ' : '') + word;
                chatItemData.setAnswer(currentAnswer);

                if (index === words.length - 1) {
                    onStreamComplete();
                }
            }, index * 100);
        });

        function onStreamComplete() {
            chatItemData.setIsStreaming(false);
            setIsWaitingForAnswer(false);
        }

        return answer;
    };

    const depletedQuestionsChatItem = {
        chatId: uuidv4(),
        itemType: 'streamAnswer',
        streamFunction: fakeStreamFunction
    };

    setChatItems(old => [...old, depletedQuestionsChatItem]);
    setChatHistory(old => [...old, `[assistant] ${answer}`]);
    setIsWaitingForAnswer(false);
}

function handleScrollLeft() {
    ulScrollRef.current.scrollLeft -= 50; // Adjust the scroll amount as needed
}

function handleScrollRight() {
    ulScrollRef.current.scrollLeft += 50; // Adjust the scroll amount as needed
}

function handleScroll() {

    if (chatItems.length < 3) {
        return;
    }

    const currentScroll = scrollDivRef.current.scrollTop;
    if (currentScroll === 0) {
        setShowNewAnswer(false);
    }

    let command = '';
    if (currentScroll > 25) {
        command = 'hide';
    }

    if (currentScroll <= 100) {
        command = 'show';
    }

    if (command !== scrollThresholdDirection) {
        setScrollThresholdDirection(command);
    }
}

return <>
    <div className="chat-wrapper">
        <div className="chat-input">
            <div className="input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your question"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleGetCompletion} />
            </div>
            <div className={isWaitingForAnswer ? 'send-icon-wrapper disabled' : 'send-icon-wrapper'}
                onClick={handleGetCompletion}>
                {
                    !isWaitingForAnswer ?
                        <FaPaperPlane className='send-icon' /> :
                        <FaBan className='send-icon' />
                }
            </div>
        </div>

        {/* [CT DEBUG] */}
        {/* <p>
                <span style={{ marginRight: 30, color: 'red' }}>Remaining Questions: {cookieManager.getChatTokensLeftCount()}</span>
                <span style={{ marginRight: 30, color: 'red' }}>Reset time: {cookieManager.getTokenResetTime()}</span>
                <span style={{ marginRight: 30, color: 'red' }}>Time to Reset: {cookieManager.getCountdownToTokenReset()}</span>
            </p> */}

        <div className="technical-skills-wrapper">
            <div className="skills-container">
                <SkillItem
                    title="OpenAI"
                    onClick={handleSkillClick} />
                <SkillItem
                    title="React"
                    onClick={handleSkillClick} />
                <SkillItem
                    title="Angular"
                    onClick={handleSkillClick} />
                <SkillItem
                    title="DotNet"
                    onClick={handleSkillClick} />
                <SkillItem
                    title="Java"
                    onClick={handleSkillClick} />
                {/* <SkillItem
                        title="Android"
                        onClick={handleSkillClick} /> */}
                {/* <SkillItem
                        title="iOS"
                        onClick={handleSkillClick} /> */}
                <SkillItem
                    title="AWS"
                    onClick={handleSkillClick} />
                {/* <SkillItem
                        title="Azure"
                        onClick={handleSkillClick} /> */}
            </div>
        </div>

        <div className={`suggestions-wrapper`}>
            <div className='suggestions-container'>
                <FaCaretLeft className="arrow-left" onClick={handleScrollLeft} />
                <ul ref={ulScrollRef} className="prompt-suggestions">
                <li>
                        <button onClick={handlePromptSuggestionClick}>
                            Tell me more about Carlo's experience in Tech
                        </button>
                    </li>
                    <li>
                        <button onClick={handlePromptSuggestionClick}>
                            Tell me how this website was developed
                        </button>
                    </li>
                    <li>
                        <button onClick={handlePromptSuggestionClick}>
                            Tell me about Carlo's experience with Mobile development
                        </button>
                    </li>
                    <li>
                        <button onClick={handlePromptSuggestionClick}>
                            Tell me about Carlo's experience across industries
                        </button>
                    </li>
                    <li>
                        <button onClick={handlePromptSuggestionClick}>
                            What are Carlo's hobbies?
                        </button>
                    </li>
                    <li>
                        <button onClick={handlePromptSuggestionClick}>
                            Should I hire Carlo?
                        </button>
                    </li>
                    <li>
                        <button onClick={handlePromptSuggestionClick}>
                            Can I contact Carlo directly?
                        </button>
                    </li>
                </ul>
                <FaCaretRight className="arrow-right" onClick={handleScrollRight} />
            </div>
        </div>

        <div className="chat-panel-wrapper">
            <button className={showNewAnswer ? "scroll-to-top new-answer" : "scroll-to-top"}
                onClick={scrollToTop}>
                <FaArrowUp />
            </button>
            <div className="chat-panel">
                <React.Fragment>
                    <div className="chat-panel-messages" ref={scrollDivRef} onScroll={handleScroll}>
                        {
                            chatItems.slice().reverse().map(item => (
                                <ChatItem
                                    key={item.chatId}
                                    chatItemData={item} />
                            ))
                        }
                    </div>
                </React.Fragment>
            </div>
        </div>

    </div>
</>
}

export default Chat;