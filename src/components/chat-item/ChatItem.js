import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import './ChatItem.scss';

const RESUME_LINK = process.env.REACT_APP_RESUME_LINK;

function ChatItem(props) {
    const { chatItemData } = props;

    switch (chatItemData.itemType) {
        case "query":
            return <QueryChatItem chatItemData={chatItemData} />
        case "streamAnswer":
            return <StreamChatItem chatItemData={chatItemData} />
        default:
            throw new Error(`${chatItemData.itemType} unknown.`)
    }
}

function QueryChatItem(props) {
    const { chatItemData } = props;
    return <>
        <div className='query-item' data-chat-id={chatItemData.chatId}>
            <div className='query-item-wrapper'>
                <span className='chat-text'>
                    {chatItemData.prompt}
                </span>
            </div>
            <div className='chat-avatar' aria-hidden='true'>🙂</div>
        </div>
    </>
}

function StreamChatItem(props) {
    const [answer, setAnswer] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const { chatItemData } = props;

    useEffect(() => {
        chatItemData.setAnswer = newText => {
            chatItemData.answer = newText;
            setAnswer(newText);
        };

        chatItemData.setIsStreaming = newValue => {
            setIsStreaming(newValue);
        }

        async function streamAnswer() {
            if (!chatItemData.isStreaming) {
                chatItemData.isStreaming = true;
                if (chatItemData.streamFunction) {
                    chatItemData.finalAnswer =
                        await chatItemData.streamFunction(chatItemData)
                            .then(() => {
                                chatItemData.isStreaming = false;
                            });
                }
            } else if (chatItemData.finalAnswer) {
                setAnswer(chatItemData.finalAnswer);
            } else {
                setAnswer(chatItemData.answer);
            }
        }

        streamAnswer();
    }, [chatItemData]);

    return <>
        <div className='stream-item'>
            <div className='chat-avatar' aria-hidden='true'>🤖</div>
            <div className='stream-item-wrapper'>
                <span className='chat-text'>
                    <ReactMarkdown components={{
                        p: 'span',
                        // A link to "resume" in the markdown opens the resume PDF
                        a: ({ href, children }) => (
                            <a
                                href={href === 'resume' ? RESUME_LINK : href}
                                target='_blank'
                                rel='noopener noreferrer'>
                                {children}
                            </a>
                        )
                    }}>
                        {answer}
                    </ReactMarkdown>
                    <span className={isStreaming ? 'is-streaming' : ''}></span>
                </span>
            </div>
        </div>
    </>
}

export default ChatItem;
