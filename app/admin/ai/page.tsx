"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, Paperclip, Bot, User, FileText, Image as ImageIcon } from "lucide-react";
import { generateContentWithMedia } from "@/lib/ai/gemini";
import { uploadImage } from "@/lib/services/storage";

interface Message {
    id: string;
    role: "user" | "model";
    content: string;
    attachments?: { type: "image" | "file"; url: string; name: string }[];
}

export default function AIChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && files.length === 0) || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            attachments: files.map(f => ({
                type: f.type.startsWith("image/") ? "image" : "file",
                url: URL.createObjectURL(f),
                name: f.name
            }))
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            // Upload files first if any
            const uploadedUrls = [];
            for (const file of files) {
                // For demo, we assume image upload works. For other files, we might need a different path.
                // In a real app, we'd upload to storage and pass the URL/MimeType to Gemini.
                // Here we'll just pass the file object directly to our updated service.
                uploadedUrls.push(file);
            }

            const response = await generateContentWithMedia(userMessage.content, files);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "model",
                content: response,
            };

            setMessages(prev => [...prev, botMessage]);
            setFiles([]);
        } catch (error) {
            console.error("Error generating content:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "model",
                content: "Désolé, une erreur est survenue lors de la génération.",
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-display">Assistant IA (Gemini)</h1>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <Bot className="h-16 w-16 mb-4" />
                            <p className="text-lg">Posez une question ou demandez de générer du contenu.</p>
                            <p className="text-sm">Vous pouvez joindre des images ou des fichiers.</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "model" && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Bot className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                        }`}
                                >
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {msg.attachments.map((att, idx) => (
                                                <div key={idx} className="bg-black/20 rounded p-1 flex items-center gap-1 text-xs">
                                                    {att.type === "image" ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                                    {att.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                                        <User className="h-5 w-5 text-secondary" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="bg-muted rounded-lg p-3 flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Génération en cours...
                            </div>
                        </div>
                    )}
                </CardContent>
                <div className="p-4 border-t bg-surface/50">
                    {files.length > 0 && (
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs">
                                    {file.type.startsWith("image/") ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                    <span className="truncate max-w-[100px]">{file.name}</span>
                                    <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="hover:text-error">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            title="Joindre un fichier"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Écrivez votre message..."
                            className="flex-1"
                        />
                        <Button type="submit" disabled={loading || (!input.trim() && files.length === 0)}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
