"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-display">Réglages</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Général</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Titre du site</label>
                        <Input defaultValue="Owlister" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input defaultValue="Le meilleur du Webtoon et de la création." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email de contact</label>
                        <Input defaultValue="contact@owlister.com" />
                    </div>
                    <Button>
                        <Save className="mr-2 h-4 w-4" /> Enregistrer
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Réseaux Sociaux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Twitter / X</label>
                        <Input placeholder="https://x.com/..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Instagram</label>
                        <Input placeholder="https://instagram.com/..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Discord</label>
                        <Input placeholder="https://discord.gg/..." />
                    </div>
                    <Button>
                        <Save className="mr-2 h-4 w-4" /> Enregistrer
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
