"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Trash2, Copy } from "lucide-react";
import { uploadImage } from "@/lib/services/storage";

export default function MediaPage() {
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]); // In a real app, fetch from DB/Storage list

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        try {
            const file = e.target.files[0];
            const url = await uploadImage(file, "media");
            setImages(prev => [url, ...prev]);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        alert("URL copiée !");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-display">Médiathèque</h1>
                <div className="relative">
                    <input
                        type="file"
                        id="media-upload"
                        className="hidden"
                        onChange={handleUpload}
                        accept="image/*"
                        disabled={uploading}
                    />
                    <Button asChild disabled={uploading}>
                        <label htmlFor="media-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? "Envoi..." : "Ajouter une image"}
                        </label>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Images récentes</CardTitle>
                </CardHeader>
                <CardContent>
                    {images.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune image pour le moment.</p>
                            <p className="text-sm">Téléversez des fichiers pour les voir ici.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {images.map((url, idx) => (
                                <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted">
                                    <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="icon" variant="secondary" onClick={() => copyToClipboard(url)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
