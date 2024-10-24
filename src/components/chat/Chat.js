import React, { useState, useRef, useEffect } from 'react';
import { FaArrowUp, FaBan, FaCaretLeft, FaCaretRight, FaPaperPlane } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';

import OpenAIService from '../../services/OpenAIService';

import ChatItem from '../chat-item/ChatItem';
import SkillItem from '../skill-item/SkillItem';

import './Chat.scss';
import cookieManager from '../../util/CookieManager';

function Chat() {
    const [query, setQuery] = useState("");

    const inputRef = useRef(null);
    const scrollDivRef = useRef(null);
    const ulScrollRef = useRef(null);

    // Chat state variables
    const [showNewAnswer, setShowNewAnswer] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const [canAsk, setCanAsk] = useState(true);
    const [tokenCount, setTokenCount] = useState(3);

    const [scrollThresholdDirection, setScrollThresholdDirection] = useState('none');
    const [chatItems, setChatItems] = useState([]);
    const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

    useEffect(() => {
        // On page load, check if tokens are already stored in sessionStorage
        const tokenCookie = cookieManager.getChatTokens();
        setTokenCount(tokenCookie);
        if (tokenCookie <= 0) {
            setCanAsk(false);
        }

        const greeting = `
**Carlo** is a seasoned **software architect** and **engineer** with over ten years dedicated to crafting enterprise solutions. He has worked on a range of projects across various industries, including **Finance**, **Healthcare**, **Telecoms** and **Video Game**.

His technical knowledge spans **Java / Spring Boot**, **.NET**, **React**, **Angular**, **Mobile development**, **Cloud platforms** and others. Currently, he is developing an indie video game, where he mixes his software development and artistic expression.

Want to learn more about Carlo? **Just ask!**`;

        const greetingChatItem = {
            chatId: uuidv4(),
            itemType: 'streamAnswer',
            finalAnswer: "hi"
        };

        setChatItems([greetingChatItem]);
    }, []);

    useEffect(() => {
        setShowNewAnswer(scrollDivRef.current.scrollTop >= 5)
    }, [chatItems]);

    function scrollToTop() {
        scrollDivRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        setShowNewAnswer(false);
    }

    function handleSkillClick(event) {
        setQuery(event);
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
        setCanAsk(canAsk);
        const currentTokens = cookieManager.getChatTokens();
        setTokenCount(currentTokens);

        if (query === "" || isWaitingForAnswer || !canAsk) {
            return;
        }

        if (event.key === 'Enter' || event.type === 'click') {
            const tokensLeft = cookieManager.reduceChatTokens();
            setTokenCount(tokensLeft);
            setCanAsk(cookieManager.canAskQuestion());
            

            setIsWaitingForAnswer(true);

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

                    const lambdaResponse = await OpenAIService
                        .streamAnswer(
                            query,
                            chatHistory);

                    const decoder = new TextDecoder("utf-8");

                    let answer = '';
                    let unprocessedAnswer = '';

                    if (chatItemData.finalAnswer) {
                        return;
                    }

                    for await (const event of lambdaResponse.EventStream) {
                        setIsWaitingForAnswer(true);
                        const text = decoder.decode(event.PayloadChunk?.Payload);
                        if (!text.includes('[CNSR-METADATA]')) {
                            chatItemData.setIsStreaming(true);
                            if (chatItemData.setAnswer) {
                                answer += text;
                                chatItemData.setAnswer(answer);
                            }
                        }
                        unprocessedAnswer += text;
                    }


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
                <div className={isWaitingForAnswer || !canAsk ? 'send-icon-wrapper disabled' : 'send-icon-wrapper'}
                    onClick={handleGetCompletion}>
                    {
                        !isWaitingForAnswer && canAsk ? 
                        <FaPaperPlane className='send-icon' /> :
                        <FaBan className='send-icon' />
                    }
                </div>
            </div>

            {/* [CT DEBUG] */}
            {/* <p style={{color: 'red'}}>
                Remaining Questions: {tokenCount} <br />
                Reset time: {cookieManager.getTokenResetTime()} <br />
                Time to Reset: {cookieManager.getCountdownToTokenReset()}
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
                                Tell me about Carlo's experience with Web Development
                            </button>
                        </li>
                        <li>
                            <button onClick={handlePromptSuggestionClick}>
                            Tell me about Carlo's experience with Mobile development
                            </button>
                        </li>
                        <li>
                            <button onClick={handlePromptSuggestionClick}>
                                What are Carlo's best professional accomplishmens?
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