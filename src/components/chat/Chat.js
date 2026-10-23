import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaArrowUp, FaBan, FaCaretLeft, FaCaretRight, FaPaperPlane } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';

import OpenAIService from '../../services/OpenAIService';

import ChatItem from '../chat-item/ChatItem';
import SkillItem from '../skill-item/SkillItem';

import './Chat.scss';
import cookieManager from '../../util/CookieManager';
import { typeWords } from '../../util/typeWords';
import { readStream } from '../../util/readStream';

const SCROLL_THRESHOLD = 100;
const STREAM_ERROR_MESSAGE = "Sorry, I couldn't reach the AI service just now. Please try again in a moment, or [request Carlo's resume](resume) instead.";

function Chat(props) {
    const NO_TOKENS_PROMPT = process.env.REACT_APP_NO_TOKENS_PROMPT;
    const GREETING_PROMPT = process.env.REACT_APP_GREETING_PROMPT;

    const PROMPT_SUGGESTIONS = [
        "What AI systems has Carlo architected?",
        "How did Carlo's multi-agent HR assistant work?",
        "How did Carlo validate 7 years of transactions at 99.8% accuracy?",
        "How is this chatbot architected?",
        "How did Carlo cut deploys from 25 minutes to 2-3?",
        "What's Carlo's experience leading engineering teams?",
        "Should I hire Carlo?",
        "How can I contact Carlo?"
    ];

    const {
        openResumePopup
    } = props;

    const [query, setQuery] = useState("");

    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const [chatItems, setChatItems] = useState([]);
    const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

    const inputRef = useRef(null);
    const scrollDivRef = useRef(null);
    const ulScrollRef = useRef(null);

    const greeting = useMemo(
    () => GREETING_PROMPT.replace(/\\n/g, '\n'),
    [GREETING_PROMPT]
    );

    useEffect(() => {
        const greetingChatItem = {
            chatId: uuidv4(),
            itemType: 'streamAnswer',
            streamFunction: async (chatItemData) => {
                chatItemData.setIsStreaming(true);
                setIsWaitingForAnswer(true);

                typeWords(greeting, chatItemData.setAnswer, { delay: 50, onDone: onStreamComplete });

                function onStreamComplete(finalAnswer) {
                    chatItemData.setIsStreaming(false);
                    setIsWaitingForAnswer(false);
                    setChatHistory(old => [...old, `[assistant] ${finalAnswer}`]);
                }
            }
        };

        setChatItems([greetingChatItem]);
    }, [greeting]);

    function scrollToTop() {
        scrollDivRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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
            scrollToTop()
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

                    const reader = await OpenAIService.streamAnswer(query, chatHistory);
                    const answer = await readStream(reader, text => chatItemData.setAnswer?.(text));

                    setIsWaitingForAnswer(false);
                    chatItemData.setIsStreaming(false);
                    setChatHistory(old => [...old, `[assistant] ${answer}`]);

                    return answer;
                }
                catch (error) {
                    console.error(error);
                    chatItemData.setAnswer?.(STREAM_ERROR_MESSAGE);
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
            .replace('{0}', cookieManager.maxTokens)
            .replace('{1}', countdown);

        const fakeStreamFunction = async (chatItemData) => {
            chatItemData.setIsStreaming(true);
            setIsWaitingForAnswer(true);

            typeWords(answer, chatItemData.setAnswer, { delay: 100, onDone: onStreamComplete });

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
        setShowScrollToTop(scrollDivRef.current.scrollTop > SCROLL_THRESHOLD);
    }

    return <>
        <div className="chat-wrapper">
            <div className="dotio-input">
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
                    <SkillItem
                        title="AWS"
                        onClick={handleSkillClick} />
                </div>
            </div>

            <div className={`suggestions-wrapper`}>
                <div className='suggestions-container'>
                    <FaCaretLeft className="arrow-left" onClick={handleScrollLeft} />
                    <ul ref={ulScrollRef} className="prompt-suggestions">
                        {PROMPT_SUGGESTIONS.map(text => (
                            <li key={text}>
                                <button onClick={handlePromptSuggestionClick}>{text}</button>
                            </li>
                        ))}
                    </ul>
                    <FaCaretRight className="arrow-right" onClick={handleScrollRight} />
                </div>
            </div>

            <div className="chat-panel-wrapper">
                <button className={showScrollToTop ? "scroll-to-top visible" : "scroll-to-top"}
                    onClick={scrollToTop}>
                    <FaArrowUp />
                </button>
                <div className="chat-panel">
                    <React.Fragment>
                        <div
                            className="chat-panel-messages"
                            ref={scrollDivRef}
                            onScroll={handleScroll}>
                            {
                                chatItems.slice().reverse().map(item => {
                                    return <ChatItem
                                        openResumePopup={openResumePopup}
                                        key={item.chatId}
                                        chatItemData={item} />
                                })
                            }
                        </div>
                    </React.Fragment>
                </div>
            </div>

        </div>
    </>
}

export default Chat;