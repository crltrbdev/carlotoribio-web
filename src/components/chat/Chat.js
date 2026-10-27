import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaArrowDown, FaCaretLeft, FaCaretRight, FaPaperPlane } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';

import OpenAIService from '../../services/OpenAIService';

import ChatItem from '../chat-item/ChatItem';
import SkillItem from '../skill-item/SkillItem';

import './Chat.scss';
import cookieManager from '../../util/CookieManager';
import { typeWords } from '../../util/typeWords';
import { readStream } from '../../util/readStream';

const SCROLL_THRESHOLD = 100;
const QUESTION_TOP_GAP = 16;
const STREAM_ERROR_MESSAGE = "Sorry, I couldn't reach the AI service just now. Please try again in a moment, or [open Carlo's resume](resume) instead.";
const SKILLS = ['OpenAI', 'Python', 'Databricks', 'Spark', 'AWS', 'React'];

// Like Claude: a new question moves to the top of the panel and its answer streams in below it.
// A spacer under the last answer leaves enough room for the question to reach the top.
function findQuery(messages, chatId) {
    return chatId ? messages.querySelector(`[data-chat-id="${chatId}"]`) : null;
}

function getTopWithinPanel(messages, element) {
    return element.getBoundingClientRect().top - messages.getBoundingClientRect().top + messages.scrollTop;
}

function updateSpacer(messages, spacer, latestQueryId) {
    const latestQuery = findQuery(messages, latestQueryId);
    if (!latestQuery) {
        spacer.style.height = '0px';
        return;
    }
    const heightWithoutSpacer = messages.scrollHeight - spacer.offsetHeight;
    const contentFromQuery = heightWithoutSpacer - getTopWithinPanel(messages, latestQuery);
    spacer.style.height = `${Math.max(0, messages.clientHeight - contentFromQuery - QUESTION_TOP_GAP)}px`;
}

function Chat({ onEngage }) {
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

    const [query, setQuery] = useState("");
    const [questionsLeft, setQuestionsLeft] = useState(() => cookieManager.getChatTokens());

    const [showJumpToLatest, setShowJumpToLatest] = useState(false);
    // The newest question; it's scrolled to the top of the panel when it's sent
    const latestQueryIdRef = useRef(null);
    const shouldScrollToQueryRef = useRef(false);
    const [chatHistory, setChatHistory] = useState([]);

    const [chatItems, setChatItems] = useState([]);
    const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

    const inputRef = useRef(null);
    const scrollDivRef = useRef(null);
    const spacerRef = useRef(null);
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

    // The spacer shrinks as the answer grows, so the view stays put while it streams
    useEffect(() => {
        const observer = new MutationObserver(() =>
            updateSpacer(scrollDivRef.current, spacerRef.current, latestQueryIdRef.current));
        observer.observe(scrollDivRef.current, { childList: true, subtree: true, characterData: true });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const messages = scrollDivRef.current;
        const latestQuery = findQuery(messages, latestQueryIdRef.current);
        if (!shouldScrollToQueryRef.current || !latestQuery) {
            return;
        }
        shouldScrollToQueryRef.current = false;
        updateSpacer(messages, spacerRef.current, latestQueryIdRef.current);
        messages.scrollTo({ top: getTopWithinPanel(messages, latestQuery) - QUESTION_TOP_GAP, behavior: 'smooth' });
    }, [chatItems]);

    function showNewQuestion(chatId) {
        latestQueryIdRef.current = chatId;
        shouldScrollToQueryRef.current = true;
    }

    function scrollToLatest() {
        scrollDivRef.current.scrollTo({ top: scrollDivRef.current.scrollHeight, behavior: 'smooth' });
    }

    function handleSkillClick(event) {
        setQuery(event);
        inputRef.current.focus();
    }

    function handleChange(event) {
        onEngage?.();
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

            setQuestionsLeft(cookieManager.reduceChatTokens());

            const queryChatItem = {
                chatId: uuidv4(),
                itemType: 'query',
                prompt: query
            };

            showNewQuestion(queryChatItem.chatId);
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
        showNewQuestion(queryChatItem.chatId);
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
        const messages = scrollDivRef.current;
        const distanceFromBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight;
        setShowJumpToLatest(distanceFromBottom > SCROLL_THRESHOLD);
    }

    return <>
        <div className="chat-wrapper">
            <div className="dotio-input">
                <div className="input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type your question"
                        aria-label="Ask a question about Carlo"
                        value={query}
                        onFocus={onEngage}
                        onChange={handleChange}
                        onKeyDown={handleGetCompletion} />
                </div>
                <span className="questions-left"
                    aria-label={`${questionsLeft} of ${cookieManager.maxTokens} questions left`}>
                    {questionsLeft}/{cookieManager.maxTokens} left
                </span>
                <button className={isWaitingForAnswer ? 'send-icon-wrapper disabled' : 'send-icon-wrapper'}
                    aria-label={isWaitingForAnswer ? 'Waiting for the answer' : 'Send question'}
                    onClick={handleGetCompletion}>
                    {
                        !isWaitingForAnswer ?
                            <FaPaperPlane className='send-icon' /> :
                            <span className='spinner' />
                    }
                </button>
            </div>

            <div className="technical-skills-wrapper">
                <div className="skills-container">
                    {SKILLS.map(skill => (
                        <SkillItem key={skill} title={skill} onClick={handleSkillClick} />
                    ))}
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
                <button className={showJumpToLatest ? "jump-to-latest visible" : "jump-to-latest"}
                    aria-label="Jump to the latest message"
                    onClick={scrollToLatest}>
                    <FaArrowDown />
                </button>
                <div className="chat-panel">
                    <React.Fragment>
                        <div
                            className="chat-panel-messages"
                            ref={scrollDivRef}
                            onScroll={handleScroll}
                            onTouchMove={onEngage}
                            onWheel={onEngage}>
                            {
                                chatItems.map(item => {
                                    return <ChatItem
                                        key={item.chatId}
                                        chatItemData={item} />
                                })
                            }
                            <div className="chat-spacer" ref={spacerRef} aria-hidden="true" />
                        </div>
                    </React.Fragment>
                </div>
            </div>

        </div>
    </>
}

export default Chat;