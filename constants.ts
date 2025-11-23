
import { Article, Comic, ContentType } from "./types";

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    type: ContentType.ARTICLE,
    title: 'The Silence of the Synths',
    excerpt: 'In 2048, analog frequencies are illegal. One underground club fights to keep the wave alive.',
    coverImage: 'https://picsum.photos/800/600?random=1',
    date: '2024-05-12',
    author: { name: 'CyberJunkie', avatar: 'https://picsum.photos/100/100?random=10' },
    tags: ['Music', 'Dystopia', 'Tech'],
    likes: 1204,
    originalLanguage: 'en',
    content: `
      <h1>The Analog Resistance</h1>
      <p>It started with a hum. A low frequency that the neural implants couldn't filter out. In the deep sectors of Neo-Paris, the resistance isn't fighting with guns, but with synthesizers.</p>
      <img src="https://picsum.photos/800/400?random=101" alt="Synth setup" />
      <p><b>Artys x Unlmtd</b> presents an exclusive look into the bunkers where the sound waves are pure, unadulterated by the government's harmonic suppressors.</p>
      <blockquote>"They can censor our speech, but they can't quantize our souls." - DJ Void</blockquote>
    `
  },
  {
    id: '2',
    type: ContentType.ARTICLE,
    title: 'Neuralink Updates: V4.0 Glitches',
    excerpt: 'Users report hallucinations of geometric angels. Tech giants claim it is a feature, not a bug.',
    coverImage: 'https://picsum.photos/800/600?random=2',
    date: '2024-05-10',
    author: { name: 'TechOracle', avatar: 'https://picsum.photos/100/100?random=11' },
    tags: ['Tech', 'Neural', 'News'],
    likes: 856,
    originalLanguage: 'en',
    content: `<h1>A Vision of Geometry</h1><p>The latest update was supposed to increase processing speed by 40%. Instead, users are seeing the fabric of reality tear apart.</p>`
  }
];

export const MOCK_COMICS: Comic[] = [
  {
    id: '101',
    type: ContentType.COMIC,
    title: 'Neon Shadows: Episode 1',
    excerpt: 'A detective tracks a rogue AI through the rainy streets of Sector 7.',
    coverImage: 'https://picsum.photos/600/800?random=3',
    date: '2024-05-14',
    author: { name: 'InkMaster', avatar: 'https://picsum.photos/100/100?random=12' },
    tags: ['Noir', 'Cyberpunk', 'Webtoon'],
    likes: 3400,
    originalLanguage: 'en',
    pages: [
      'https://picsum.photos/800/1200?random=20',
      'https://picsum.photos/800/1200?random=21',
      'https://picsum.photos/800/1200?random=22',
      'https://picsum.photos/800/1200?random=23'
    ]
  }
];
