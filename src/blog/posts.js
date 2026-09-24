import aiIsAFeature from './posts/ai-is-a-feature-not-a-product.md';
import modernizingWithoutBigBang from './posts/modernizing-without-the-big-bang.md';
import loopBetweenMusicAndSoftware from './posts/the-loop-between-music-and-software.md';

// [CT] To publish a post: drop a .md file in ./posts, import it above, and add an entry here.
const posts = [
    {
        slug: 'ai-is-a-feature-not-a-product',
        title: 'AI Is a Feature, Not a Product',
        date: '2026-09-15',
        readMinutes: 3,
        excerpt: 'The demo is magical, the pilot is promising, and the production rollout is a quiet lesson in the difference between a model that works and a product that works.',
        tags: ['ai', 'architecture', 'enterprise'],
        contentUrl: aiIsAFeature
    },
    {
        slug: 'modernizing-without-the-big-bang',
        title: 'Modernizing Without the Big Bang',
        date: '2026-08-30',
        readMinutes: 3,
        excerpt: 'Nobody greenlights a rewrite anymore. The middle path is boring and it works: peel the legacy system apart at the seams while it keeps running.',
        tags: ['architecture', 'legacy', 'migration'],
        contentUrl: modernizingWithoutBigBang
    },
    {
        slug: 'the-loop-between-music-and-software',
        title: 'The Loop Between Music and Software',
        date: '2026-08-10',
        readMinutes: 2,
        excerpt: 'I spend my days designing systems and my nights in Ableton, and I’ve stopped pretending those are separate hobbies.',
        tags: ['music', 'craft', 'personal'],
        contentUrl: loopBetweenMusicAndSoftware
    }
];

const sortedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date));

export function getPosts() {
    return sortedPosts;
}

export function getPost(slug) {
    return sortedPosts.find(post => post.slug === slug);
}

export function formatPostDate(dateString) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
