import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaFeatherAlt } from 'react-icons/fa';

import { getPosts, formatPostDate } from '../../blog/posts';

import './Blog.scss';

function Blog(props) {
    const posts = getPosts();

    return <>
        <section className={`blog-wrapper ${props.className}`}>
            <header className="blog-header">
                <Link to="/" className="blog-nav-link">
                    <FaArrowLeft />
                    <span>Home</span>
                </Link>
                <div className="blog-title">
                    <FaFeatherAlt className="blog-title-icon" />
                    <h1>Blog</h1>
                </div>
                <span className="blog-nav-spacer" />
            </header>

            <div className="blog-scroll">
                <div className="blog-list">
                    {
                        posts.map((post, index) => (
                            <Link
                                to={`/blog/${post.slug}`}
                                className="post-card"
                                key={post.slug}
                                style={{ animationDelay: `${index * 70}ms` }}>
                                <div className="post-meta">
                                    <time>{formatPostDate(post.date)}</time>
                                    <span className="meta-dot">·</span>
                                    <span>{post.readMinutes} min read</span>
                                </div>
                                <h2>{post.title}</h2>
                                <p>{post.excerpt}</p>
                                <div className="post-footer">
                                    <div className="post-tags">
                                        {post.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}
                                    </div>
                                    <span className="read-more">
                                        Read <FaArrowRight />
                                    </span>
                                </div>
                            </Link>
                        ))
                    }
                </div>
            </div>
        </section>
    </>;
}

export default Blog;
