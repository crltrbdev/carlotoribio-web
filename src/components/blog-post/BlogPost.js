import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaFeatherAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

import { getPost, formatPostDate } from '../../blog/posts';
import { useMarkdown } from '../../util/useMarkdown';

import './BlogPost.scss';

function BlogPost(props) {
    const { slug } = useParams();
    const post = getPost(slug);
    const { markdown, isLoading } = useMarkdown(post ? post.contentUrl : '');

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    return <>
        <section className={`blog-post-wrapper ${props.className}`}>
            <header className="blog-header">
                <Link to="/blog" className="blog-nav-link">
                    <FaArrowLeft />
                    <span>Blog</span>
                </Link>
                <div className="blog-title">
                    <FaFeatherAlt className="blog-title-icon" />
                </div>
                <span className="blog-nav-spacer" />
            </header>

            <div className="blog-scroll">
                <article className="post-article">
                    <div className="post-meta">
                        <time>{formatPostDate(post.date)}</time>
                        <span className="meta-dot">·</span>
                        <span>{post.readMinutes} min read</span>
                    </div>
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-tags">
                        {post.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}
                    </div>

                    <div className="post-body">
                        {
                            isLoading
                                ? <p className="post-loading">Loading…</p>
                                : <ReactMarkdown
                                    components={{
                                        a: ({ href, children }) => (
                                            <a href={href} target="_blank" rel="noopener noreferrer">
                                                {children}
                                            </a>
                                        )
                                    }}>
                                    {markdown}
                                </ReactMarkdown>
                        }
                    </div>

                    <div className="post-end">
                        <Link to="/blog" className="back-to-blog">
                            <FaArrowLeft />
                            <span>All posts</span>
                        </Link>
                    </div>
                </article>
            </div>
        </section>
    </>;
}

export default BlogPost;
