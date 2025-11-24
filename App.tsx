import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import Nav from './components/Nav';
import Footer from './components/Footer';
import RichTextEditor from './components/RichTextEditor';
import ShareModal from './components/ShareModal';
import CommentSection from './components/CommentSection';
import { Article, Comic, ContentItem, ContentType, Comment, Subscriber, User, UserRole, Language } from './types';
import { loadContent, saveContentItem, deleteContentItem, loadComments, deleteComment, loadSubscribers, loginUser, registerUser, getCurrentUser, uploadImageFile, checkAuthState, loginWithProvider } from './services/storage';
import { Heart, Share2, Clock, ArrowLeft, Trash2, Plus, Upload, FileText, Film, Mail, MessageCircle, Sparkles, Brain, Image as ImageIcon, Video as VideoIcon, Download, Loader2, UserPlus, Languages, Send, Chrome, Linkedin, Apple } from 'lucide-react';

// --- AI HELPER ---
const generateText = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    alert("API_KEY not found in environment.");
    return "";
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (e) {
    console.error(e);
    return "";
  }
};

// --- PAGES ---

// 0. AUTH / LOGIN
const Login = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.READER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(name, email, role, password);
      } else {
        const user = await loginUser(email, password);
        if (!user) throw new Error("User not found");
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'apple' | 'linkedin') => {
      setError('');
      setLoading(true);
      try {
          await loginWithProvider(provider);
          navigate('/');
      } catch (err: any) {
          console.error(err);
          // Friendly error message for users
          let msg = "Login failed.";
          if (err.code === 'auth/operation-not-allowed') msg = "This provider is not enabled in Firebase Console yet.";
          if (err.code === 'auth/popup-closed-by-user') msg = "Login cancelled.";
          setError(msg);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen pt-32 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-card-bg border border-neon-green/30 p-8 rounded-2xl shadow-2xl shadow-neon-purple/10">
        <h2 className="text-3xl font-anton text-white mb-2 text-center">{isRegister ? 'Join the Resistance' : 'Identify Yourself'}</h2>
        <p className="text-center text-gray-400 mb-8 text-sm font-roboto tracking-wider">ACCESS THE NETWORK</p>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <div className="flex flex-col gap-3 mb-6">
            <button onClick={() => handleProviderLogin('google')} className="flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black font-bold py-2.5 rounded transition-colors uppercase tracking-wide text-sm">
                <Chrome size={18} /> Continue with Google
            </button>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleProviderLogin('apple')} className="flex items-center justify-center gap-2 bg-black border border-gray-700 hover:border-white text-white font-bold py-2.5 rounded transition-colors uppercase tracking-wide text-sm">
                    <Apple size={18} /> Apple
                </button>
                <button onClick={() => handleProviderLogin('linkedin')} className="flex items-center justify-center gap-2 bg-[#0077b5] hover:bg-[#005e93] text-white font-bold py-2.5 rounded transition-colors uppercase tracking-wide text-sm">
                    <Linkedin size={18} /> LinkedIn
                </button>
            </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-gray-700 flex-1"></div>
            <span className="text-gray-500 text-xs uppercase">Or with frequency code</span>
            <div className="h-px bg-gray-700 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Codename</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-neon-purple outline-none" placeholder="e.g. Neo" />
            </div>
          )}
          
          <div>
            <label className="block text-xs uppercase text-gray-500 mb-1">Email Frequency</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-neon-purple outline-none" placeholder="name@owlister.com" />
          </div>

          <div>
             <label className="block text-xs uppercase text-gray-500 mb-1">Passcode (Password)</label>
             <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-neon-purple outline-none" placeholder="******" />
          </div>

          {isRegister && (
             <div>
               <label className="block text-xs uppercase text-gray-500 mb-1">Role (Clearance Level)</label>
               <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-neon-purple outline-none">
                 <option value={UserRole.READER}>Reader (Observer)</option>
                 <option value={UserRole.EDITOR}>Editor (Content Creator)</option>
                 <option value={UserRole.ADMIN}>Admin (System Core)</option>
               </select>
             </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-neon-purple hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-3 rounded uppercase tracking-widest transition-all mt-4 flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : (isRegister ? 'Initialize Account' : 'Connect')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-gray-400 hover:text-white text-sm underline decoration-neon-green">
            {isRegister ? 'Already have an ID? Login' : 'Need access? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 1. HOME / FEED
const Home = ({ language }: { language: Language }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  useEffect(() => {
    const fetchContent = async () => {
        setLoading(true);
        const data = await loadContent();
        if (filter) {
            setContent(data.filter(item => item.type === filter));
        } else {
            setContent(data);
        }
        setLoading(false);
    };
    fetchContent();
  }, [filter]);

  const titles = {
    fr: "Voir au-delà. Être Singulier.",
    en: "See beyond. Be Singular.",
    es: "Ver más allá. Ser Singular."
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-anton text-white mb-2 tracking-wide uppercase">
          <span className="text-neon-purple animate-pulse">Owlister</span>
        </h1>
        <p className="text-xl text-gray-400 font-roboto tracking-widest">{titles[language]}</p>
      </div>

      {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={40} className="text-neon-green animate-spin" /></div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {content.map((item) => (
            <div key={item.id} className="break-inside-avoid bg-card-bg/80 backdrop-blur-sm rounded-xl border border-neon-green overflow-hidden hover:border-neon-purple hover:shadow-[0_0_20px_rgba(176,38,255,0.3)] transition-all duration-300 group">
                <Link to={item.type === ContentType.ARTICLE ? `/article/${item.id}` : `/comic/${item.id}`}>
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        <span className="text-xs font-bold font-roboto text-white uppercase tracking-wider">
                        {item.type === ContentType.ARTICLE ? 'Story' : 'Webtoon'}
                        </span>
                    </div>
                    {item.originalLanguage && (
                        <div className="bg-neon-purple/80 px-2 py-1 rounded-full text-[10px] font-bold uppercase text-white flex items-center">
                        {item.originalLanguage}
                        </div>
                    )}
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-neon-green uppercase border border-neon-green/30 px-2 py-0.5 rounded-sm">
                        #{tag}
                        </span>
                    ))}
                    </div>
                    <h2 className="text-2xl font-anton text-white mb-3 leading-tight group-hover:text-neon-purple transition-colors">{item.title}</h2>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 font-poppins">{item.excerpt}</p>
                    
                    <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                    <div className="flex items-center gap-2">
                        <img src={item.author.avatar || 'https://picsum.photos/50'} alt={item.author.name} className="w-6 h-6 rounded-full" />
                        <span className="text-xs text-gray-400 font-roboto uppercase">{item.author.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-xs">
                        <span className="flex items-center gap-1"><Clock size={12} /> {item.date}</span>
                        <span className="flex items-center gap-1 text-neon-purple"><Heart size={12} fill="currentColor" /> {item.likes}</span>
                    </div>
                    </div>
                </div>
                </Link>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

// 2. ARTICLE READER
const ArticleView = ({ language }: { language: Language }) => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        const data = await loadContent();
        const found = data.find(i => i.id === id && i.type === ContentType.ARTICLE) as Article;
        if (found) {
            setArticle(found);
            setDisplayedTitle(found.title);
            setDisplayedContent(found.content);
        }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const translate = async () => {
      if (!article) return;
      if (article.originalLanguage === language) {
        setDisplayedTitle(article.title);
        setDisplayedContent(article.content);
        return;
      }

      setIsTranslating(true);
      const prompt = `
        Translate the following JSON object to ${language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English'}.
        Keep HTML tags exactly as they are. Do not translate class names or ids.
        Only translate text content.
        JSON: { "title": "${article.title}", "content": "${article.content.replace(/"/g, '\\"')}" }
        Return ONLY the JSON.
      `;
      
      try {
        const jsonStr = await generateText(prompt);
        const cleanJson = jsonStr.replace(/```json|```/g, '').trim();
        const translated = JSON.parse(cleanJson);
        setDisplayedTitle(translated.title);
        setDisplayedContent(translated.content);
      } catch (e) {
        console.error("Translation failed", e);
        setDisplayedTitle(article.title + " (Translation Failed)");
        setDisplayedContent(article.content);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [language, article]);

  if (!article) return <div className="pt-32 text-center text-white flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen">
      <div className="h-[50vh] relative">
        <img src={article.coverImage} className="w-full h-full object-cover" alt="cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white mb-6 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} className="mr-2" /> Back to Feed
          </Link>
          <h1 className="text-4xl md:text-6xl font-anton text-white mb-4 leading-tight drop-shadow-lg flex items-center gap-4">
            {displayedTitle}
            {isTranslating && <Loader2 className="animate-spin text-neon-green" size={32} />}
          </h1>
          <div className="flex items-center gap-4 text-gray-300 font-roboto">
             <img src={article.author.avatar || 'https://picsum.photos/50'} className="w-8 h-8 rounded-full border border-white/20" alt="author"/>
             <span className="uppercase tracking-wider">{article.author.name}</span>
             <span>•</span>
             <span>{article.date}</span>
             {article.originalLanguage !== language && !isTranslating && (
               <span className="bg-white/10 px-2 py-1 rounded text-xs flex items-center gap-1 text-neon-green">
                 <Languages size={12} /> Translated to {language.toUpperCase()}
               </span>
             )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <article 
          className={`prose prose-invert prose-lg max-w-none font-poppins mb-12 ${isTranslating ? 'opacity-50 blur-[2px]' : 'opacity-100'} transition-all duration-500`} 
          dangerouslySetInnerHTML={{ __html: displayedContent }} 
        />

        <div className="flex items-center justify-between border-t border-white/10 pt-8 mb-12">
          <button className="flex items-center gap-2 text-neon-purple hover:text-white transition-colors">
            <Heart className="animate-pulse-slow" /> <span className="font-bold">{article.likes} LIKES</span>
          </button>
          <button onClick={() => setShareOpen(true)} className="flex items-center gap-2 text-gray-300 hover:text-neon-green transition-colors">
            <Share2 /> <span className="font-bold uppercase">Share</span>
          </button>
        </div>

        <CommentSection contentId={article.id} />
      </div>
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} title={displayedTitle} url={window.location.href} />
    </div>
  );
};

// 3. COMIC READER
const ComicView = ({ language }: { language: Language }) => {
  const { id } = useParams();
  const [comic, setComic] = useState<Comic | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
        const data = await loadContent();
        const found = data.find(i => i.id === id && i.type === ContentType.COMIC) as Comic;
        setComic(found);
    }
    fetch();
  }, [id]);

  if (!comic) return <div className="pt-32 text-center text-white flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Link>
        <h1 className="text-3xl md:text-4xl font-anton text-white">{comic.title}</h1>
        <p className="text-gray-500 mt-2 text-sm">Original Language: {comic.originalLanguage.toUpperCase()} (Visual Content)</p>
      </div>

      <div className="max-w-2xl mx-auto bg-black shadow-2xl">
        {comic.pages.map((page, idx) => (
          <img key={idx} src={page} alt={`Page ${idx + 1}`} className="w-full block" loading="lazy" />
        ))}
      </div>

      <div className="max-w-2xl mx-auto p-6 flex items-center justify-between bg-card-bg mt-4 rounded-xl mb-12 border border-white/10">
         <button className="text-neon-purple font-bold flex items-center gap-2">
           <Heart fill="currentColor" /> {comic.likes}
         </button>
         <button onClick={() => setShareOpen(true)} className="text-white font-bold uppercase flex items-center gap-2 hover:text-neon-green">
           <Share2 /> Share
         </button>
      </div>

      <div className="max-w-2xl mx-auto mb-12 px-4">
        <CommentSection contentId={comic.id} />
      </div>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} title={comic.title} url={window.location.href} />
    </div>
  );
};

// 4. ADMIN DASHBOARD
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User|null>(null);

  useEffect(() => {
      const unsubscribe = checkAuthState((u) => {
          if(!u || (u.role !== UserRole.ADMIN && u.role !== UserRole.EDITOR)) {
              navigate('/login');
          }
          setUser(u);
      });
      return () => unsubscribe();
  }, [navigate]);

  const [tab, setTab] = useState<'content' | 'comments' | 'newsletter' | 'studio'>('content');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  
  // Newsletter
  const [newsletterTopic, setNewsletterTopic] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Studio
  const [genMode, setGenMode] = useState<'image' | 'video' | 'chat'>('image');
  const [genPrompt, setGenPrompt] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [genResult, setGenResult] = useState<string | null>(null);

  // Chat
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
        if (tab === 'content') setItems(await loadContent());
        if (tab === 'comments') setComments(await loadComments());
        if (tab === 'newsletter') setSubscribers(await loadSubscribers());
    };
    fetchData();
  }, [tab]);

  useEffect(() => {
    if (genMode === 'chat') {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, genMode]);

  const handleDeleteContent = async (id: string) => {
    if (user?.role !== UserRole.ADMIN) return;
    if (confirm('Are you sure you want to delete this transmission?')) {
      setItems(await deleteContentItem(id));
    }
  };

  const handleDeleteComment = async (id: string) => {
    setComments(await deleteComment(id));
  };

  const handleGenerateNewsletter = async () => {
    if (!newsletterTopic) return;
    setIsGenerating(true);
    const prompt = `Write a short, punchy, dystopian tech/music newsletter for 'Owlister' about: ${newsletterTopic}. Use slang like 'GenZ', 'Cyberpunk'. Format it as HTML.`;
    const text = await generateText(prompt);
    setNewsletterContent(text);
    setIsGenerating(false);
  };

  const handleSendNewsletter = () => {
    alert(`Transmission sent to ${subscribers.length} frequencies.`);
    setNewsletterTopic('');
    setNewsletterContent('');
  };

  const handleGenerateAsset = async () => {
    if (!genPrompt) return;
    setGenLoading(true);
    setGenStatus("Initializing...");
    setGenResult(null);

    try {
        if (genMode === 'image') {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            setGenStatus("Dreaming up visuals (Imagen 3)...");
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: genPrompt,
                config: { numberOfImages: 1, aspectRatio: '16:9' }
            });
            const b64 = response.generatedImages?.[0]?.image?.imageBytes;
            if (b64) setGenResult(`data:image/jpeg;base64,${b64}`);
        } else if (genMode === 'video') {
            const win = window as any;
            if (win.aistudio && !await win.aistudio.hasSelectedApiKey()) {
                 setGenStatus("Waiting for API Key selection...");
                 await win.aistudio.openSelectKey();
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            setGenStatus("Queueing video generation (Veo)...");
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: genPrompt,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });
            setGenStatus("Rendering pixels (this may take a moment)...");
            while (!operation.done) {
                await new Promise(r => setTimeout(r, 5000));
                operation = await ai.operations.getVideosOperation({operation});
            }
            if(operation.response?.generatedVideos?.[0]?.video?.uri) {
                const uri = operation.response.generatedVideos[0].video.uri;
                setGenStatus("Downloading stream...");
                const res = await fetch(`${uri}&key=${process.env.API_KEY}`);
                const blob = await res.blob();
                setGenResult(URL.createObjectURL(blob));
            }
        }
    } catch (e) {
        console.error(e);
        setGenStatus("Generation failed.");
    } finally {
        setGenLoading(false);
    }
  };

  const handleChatSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      const userMsg = chatInput;
      setChatInput('');
      setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setChatLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const chat = ai.chats.create({
              model: 'gemini-2.5-flash',
              history: chatHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
          });
          const result = await chat.sendMessageStream({ message: userMsg });
          let fullResponse = '';
          setChatHistory(prev => [...prev, { role: 'model', text: '' }]);
          for await (const chunk of result) {
              const c = chunk as GenerateContentResponse;
              const text = c.text || '';
              fullResponse += text;
              setChatHistory(prev => {
                  const newHist = [...prev];
                  newHist[newHist.length - 1].text = fullResponse;
                  return newHist;
              });
          }
      } catch (e) {
          setChatHistory(prev => [...prev, { role: 'model', text: '[Connection Lost...]' }]);
      } finally {
          setChatLoading(false);
      }
  };

  if (!user) return <div className="pt-32 flex justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="min-h-screen pt-24 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-anton text-white">Command Center</h1>
          <p className="text-gray-400">Welcome, Commander {user.name}. Clearance: <span className="text-neon-green">{user.role}</span></p>
        </div>
        <div className="flex gap-2 bg-card-bg p-1 rounded-lg border border-white/10 overflow-x-auto">
           {['content', 'comments', 'newsletter', 'studio'].map((t) => {
             if (t === 'newsletter' && user.role !== UserRole.ADMIN) return null; 
             return (
                <button key={t} onClick={() => setTab(t as any)} className={`px-4 py-2 rounded uppercase font-bold text-sm tracking-wider transition-colors whitespace-nowrap ${tab === t ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white'}`}>
                  {t}
                </button>
             )
           })}
        </div>
      </div>

      {tab === 'content' && (
        <>
          <div className="flex justify-end gap-4 mb-6">
            <Link to="/admin/create-article" className="bg-neon-purple hover:bg-purple-600 text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 text-sm">
              <FileText size={16} /> New Article
            </Link>
            <Link to="/admin/create-comic" className="bg-neon-green text-black hover:bg-green-400 px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 text-sm">
              <Film size={16} /> New Comic
            </Link>
          </div>
          <div className="bg-card-bg rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-left text-gray-400">
              <thead className="bg-black/50 text-xs uppercase font-roboto text-gray-500">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Lang</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">
                      {item.title}
                      <br/>
                      <span className="text-[10px] text-neon-purple">{item.type}</span>
                    </td>
                    <td className="px-6 py-4 uppercase">{item.originalLanguage || 'FR'}</td>
                    <td className="px-6 py-4">{item.author.name}</td>
                    <td className="px-6 py-4 text-sm">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                      {user.role === UserRole.ADMIN && (
                        <button onClick={() => handleDeleteContent(item.id)} className="text-red-500 hover:text-red-400 p-2">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'comments' && (
        <div className="bg-card-bg rounded-xl border border-white/10 overflow-hidden">
             <div className="grid grid-cols-1 gap-4 p-4">
               {comments.map(c => (
                 <div key={c.id} className="bg-black/40 p-4 rounded border border-gray-800 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-neon-purple font-bold text-sm">{c.user}</span>
                        <span className="text-xs text-gray-600">{c.date}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{c.text}</p>
                    </div>
                    <button onClick={() => handleDeleteComment(c.id)} className="text-red-500 hover:text-white p-2 bg-red-500/10 hover:bg-red-500 rounded">
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
               {comments.length === 0 && <p className="text-center text-gray-500">No comments.</p>}
             </div>
        </div>
      )}

      {tab === 'newsletter' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-card-bg p-6 rounded-xl border border-white/10">
                <h3 className="text-xl font-anton text-white mb-4 flex items-center gap-2"><Brain className="text-neon-purple" /> Gemini Auto-Composer</h3>
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input type="text" value={newsletterTopic} onChange={e => setNewsletterTopic(e.target.value)} placeholder="e.g. New Synthwave trends in 2050..." className="flex-1 bg-black border border-gray-700 rounded p-3 text-white outline-none focus:border-neon-purple"/>
                    <button onClick={handleGenerateNewsletter} disabled={isGenerating} className="bg-neon-purple text-white px-4 py-2 rounded font-bold uppercase flex items-center gap-2 disabled:opacity-50">
                      {isGenerating ? <span className="animate-pulse">Thinking...</span> : <Sparkles size={16} />}
                    </button>
                  </div>
                </div>
                {newsletterContent && (
                   <div className="bg-black border border-gray-700 rounded p-4 mb-4">
                      <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{__html: newsletterContent}} />
                   </div>
                )}
                <button onClick={handleSendNewsletter} disabled={!newsletterContent} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-bold py-3 rounded uppercase tracking-widest flex items-center justify-center gap-2">
                  <Mail size={18} /> Broadcast
                </button>
             </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-card-bg p-6 rounded-xl border border-white/10 h-full">
               <h3 className="text-xl font-anton text-white mb-4">Subscribers ({subscribers.length})</h3>
               <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                 {subscribers.map((s, i) => (
                   <div key={i} className="bg-black/30 p-2 rounded border border-white/5 flex justify-between text-sm">
                      <span className="text-gray-300 truncate">{s.email}</span>
                      <span className="text-neon-green text-xs uppercase">{s.language}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'studio' && (
        <div className="bg-card-bg p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-anton text-white flex items-center gap-2">
                    <Sparkles className="text-neon-green" /> AI Asset Studio
                </h3>
                <div className="flex bg-black rounded-lg p-1 border border-gray-700">
                    <button onClick={() => setGenMode('image')} className={`px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${genMode === 'image' ? 'bg-neon-purple text-white' : 'text-gray-400'}`}><ImageIcon size={14} /> Imagen</button>
                    <button onClick={() => setGenMode('video')} className={`px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${genMode === 'video' ? 'bg-neon-purple text-white' : 'text-gray-400'}`}><VideoIcon size={14} /> Veo</button>
                    <button onClick={() => setGenMode('chat')} className={`px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${genMode === 'chat' ? 'bg-neon-purple text-white' : 'text-gray-400'}`}><MessageCircle size={14} /> Chat</button>
                </div>
            </div>

            {genMode === 'chat' ? (
                <div className="flex flex-col h-[500px] border border-white/10 rounded-lg bg-black/50 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatHistory.length === 0 && <div className="h-full flex items-center justify-center text-gray-600 italic"><p>Initialize chat sequence with Gemini...</p></div>}
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-neon-purple text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'}`}>
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        {chatLoading && <div className="flex justify-start"><div className="bg-gray-800 text-neon-green p-3 rounded-lg rounded-bl-none border border-gray-700 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /><span className="text-xs">Processing...</span></div></div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleChatSend} className="bg-card-bg p-3 border-t border-white/10 flex gap-2">
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask for story ideas..." className="flex-1 bg-black border border-gray-700 rounded px-4 py-2 text-white text-sm focus:border-neon-green outline-none" />
                        <button type="submit" disabled={chatLoading || !chatInput.trim()} className="bg-neon-green text-black hover:bg-green-400 p-2 rounded disabled:opacity-50 transition-colors"><Send size={18} /></button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <textarea value={genPrompt} onChange={e => setGenPrompt(e.target.value)} placeholder={genMode === 'image' ? "Describe your image..." : "Describe your video..."} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-neon-green outline-none h-32 mb-4 resize-none" />
                        <button onClick={handleGenerateAsset} disabled={genLoading || !genPrompt} className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 font-bold py-3 rounded uppercase tracking-widest flex items-center justify-center gap-2">
                            {genLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                            {genLoading ? 'Generating...' : 'Generate'}
                        </button>
                        {genLoading && <p className="text-center text-xs text-gray-500 mt-2 animate-pulse">{genStatus}</p>}
                    </div>
                    <div className="bg-black/50 rounded-lg border border-white/10 flex items-center justify-center min-h-[300px] p-4 relative">
                        {genResult ? (
                            <div className="w-full">{genMode === 'image' ? <img src={genResult} alt="Generated" className="w-full rounded border border-gray-700" /> : <video src={genResult} controls className="w-full rounded border border-gray-700" />}</div>
                        ) : (
                            <div className="text-center text-gray-600"><p>Output Area</p></div>
                        )}
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

// 5. CREATE ARTICLE
const CreateArticle = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User|null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [cover, setCover] = useState('');
  const [coverFile, setCoverFile] = useState<File|null>(null);
  const [lang, setLang] = useState<Language>('fr');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = checkAuthState((u) => {
        if(!u) navigate('/login');
        setUser(u);
        if (u?.role === UserRole.ADMIN) setLang('fr'); else setLang('en');
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setCoverFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setCover(ev.target?.result as string);
        reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!title) return alert("Enter a title first.");
    setIsGenerating(true);
    const prompt = `Write a blog post (HTML) for 'Owlister' about: "${title}". Language: ${lang === 'fr' ? 'French' : lang === 'es' ? 'Spanish' : 'English'}. Style: Dystopian, Tech, GenZ.`;
    const generated = await generateText(prompt);
    setContent(generated);
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
        let coverUrl = cover;
        if (coverFile) {
            coverUrl = await uploadImageFile(coverFile, `covers/${Date.now()}_${coverFile.name}`);
        }

        const newArticle: Article = {
            id: Date.now().toString(),
            type: ContentType.ARTICLE,
            title,
            excerpt,
            content,
            coverImage: coverUrl || 'https://picsum.photos/800/600',
            date: new Date().toISOString().split('T')[0],
            author: { name: user.name, avatar: user.avatar, id: user.id },
            tags: ['News', 'Tech'],
            likes: 0,
            originalLanguage: lang
        };
        await saveContentItem(newArticle);
        navigate('/admin');
    } catch (err) {
        console.error(err);
        alert("Failed to save");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-anton text-white">Write Story</h1>
         <button type="button" onClick={handleAiGenerate} disabled={isGenerating} className="bg-neon-purple/20 text-neon-purple border border-neon-purple hover:bg-neon-purple hover:text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold uppercase transition-all">
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} AI Assist
         </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-card-bg border border-gray-700 rounded p-3 text-white focus:border-neon-purple outline-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                <select value={lang} onChange={e => setLang(e.target.value as Language)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-neon-purple uppercase"><option value="fr">Français</option><option value="en">English</option><option value="es">Español</option></select>
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Excerpt</label>
          <textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full bg-card-bg border border-gray-700 rounded p-3 text-white focus:border-neon-purple outline-none h-24" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Cover Image</label>
          <div className="flex items-center gap-4">
             <label className="bg-dark-bg hover:bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2">
               <Upload size={16} /> Upload <input type="file" className="hidden" onChange={handleCoverUpload} accept="image/*" />
             </label>
             {cover && <img src={cover} alt="Preview" className="h-16 w-24 object-cover rounded" />}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
          <RichTextEditor initialContent={content} onChange={setContent} />
        </div>
        <button disabled={loading} type="submit" className="w-full bg-neon-purple hover:bg-purple-600 text-white font-bold py-4 rounded uppercase tracking-widest flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : 'Publish Story'}
        </button>
      </form>
    </div>
  );
};

// 6. CREATE COMIC
const CreateComic = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User|null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [cover, setCover] = useState('');
  const [coverFile, setCoverFile] = useState<File|null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [pageFiles, setPageFiles] = useState<File[]>([]);
  const [lang, setLang] = useState<Language>('fr');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = checkAuthState((u) => {
        if(!u) navigate('/login');
        setUser(u);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCover(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPageFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) setPages(prev => [...prev, ev.target!.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
        let coverUrl = cover;
        if(coverFile) {
             coverUrl = await uploadImageFile(coverFile, `covers/${Date.now()}_${coverFile.name}`);
        }

        const uploadedPages: string[] = [];
        // Upload all pages
        for (const file of pageFiles) {
            const url = await uploadImageFile(file, `comics/${Date.now()}_${file.name}`);
            uploadedPages.push(url);
        }

        // If no new pages uploaded (editing scenario), keep existing (not implemented in this simplified view)
        // For now, simplified to: use base64 if no file (fallback) or url if file
        // Note: in hybrid mode without keys, uploadImageFile returns base64.

        const newComic: Comic = {
            id: Date.now().toString(),
            type: ContentType.COMIC,
            title,
            excerpt,
            coverImage: coverUrl || 'https://picsum.photos/600/800',
            pages: uploadedPages.length > 0 ? uploadedPages : pages,
            date: new Date().toISOString().split('T')[0],
            author: { name: user.name, avatar: user.avatar, id: user.id },
            tags: ['Webtoon', 'Fiction'],
            likes: 0,
            originalLanguage: lang
        };
        await saveContentItem(newComic);
        navigate('/admin');
    } catch (err) {
        console.error(err);
        alert("Failed to upload comic");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-anton text-white mb-8">Upload Comic</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Series Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-card-bg border border-gray-700 rounded p-3 text-white focus:border-neon-green outline-none" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                <select value={lang} onChange={e => setLang(e.target.value as Language)} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-neon-green uppercase"><option value="fr">Français</option><option value="en">English</option><option value="es">Español</option></select>
            </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-400 mb-2">Excerpt</label>
           <textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full bg-card-bg border border-gray-700 rounded p-3 text-white focus:border-neon-green outline-none h-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Cover Art</label>
            <label className="block w-full border-2 border-dashed border-gray-700 hover:border-neon-green rounded-lg p-8 text-center cursor-pointer transition-colors bg-card-bg/50">
               <input type="file" className="hidden" onChange={handleCoverUpload} accept="image/*" />
               {cover ? <img src={cover} className="max-h-40 mx-auto" alt="cover"/> : <span className="text-gray-500">Click to upload Cover</span>}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Comic Pages (Webtoon Format)</label>
            <label className="block w-full border-2 border-dashed border-gray-700 hover:border-neon-green rounded-lg p-8 text-center cursor-pointer transition-colors bg-card-bg/50">
               <input type="file" className="hidden" onChange={handlePagesUpload} accept="image/*" multiple />
               <div className="text-gray-500"><Plus className="mx-auto mb-2" /><span>Add Pages</span></div>
            </label>
          </div>
        </div>
        {pages.length > 0 && (
          <div className="bg-card-bg p-4 rounded border border-white/10">
            <p className="text-white mb-2 font-bold">Preview ({pages.length} pages)</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {pages.map((p, i) => (
                <img key={i} src={p} className="h-32 w-auto border border-gray-600" alt={`Page ${i}`} />
              ))}
            </div>
          </div>
        )}
        <button disabled={loading} type="submit" className="w-full bg-neon-green hover:bg-green-400 text-black font-bold py-4 rounded uppercase tracking-widest flex justify-center">
           {loading ? <Loader2 className="animate-spin text-black" /> : 'Publish Comic'}
        </button>
      </form>
    </div>
  );
};

const App = () => {
  const [language, setLanguage] = useState<Language>('fr');
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-poppins text-white selection:bg-neon-purple selection:text-white">
        <Nav language={language} setLanguage={setLanguage} />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home language={language} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/article/:id" element={<ArticleView language={language} />} />
            <Route path="/comic/:id" element={<ComicView language={language} />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create-article" element={<CreateArticle />} />
            <Route path="/admin/create-comic" element={<CreateComic />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;