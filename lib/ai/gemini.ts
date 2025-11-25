import { ai } from "@/lib/firebase/client";
import { getGenerativeModel } from "firebase/ai";

const MODEL_NAME = "gemini-1.5-flash";

export async function generateOutline(topic: string): Promise<string> {
    try {
        const model = getGenerativeModel(ai, { model: MODEL_NAME });
        const prompt = `Génère un plan détaillé pour un article de blog sur le sujet suivant : "${topic}".
    Le plan doit inclure :
    - Un titre accrocheur
    - Une introduction
    - 3 à 5 sections principales avec des sous-points
    - Une conclusion
    Réponds uniquement avec le plan au format Markdown.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating outline:", error);
        throw error;
    }
}

export async function generateDraft(topic: string, outline: string): Promise<string> {
    try {
        const model = getGenerativeModel(ai, { model: MODEL_NAME });
        const prompt = `Rédige un premier brouillon complet pour un article de blog sur le sujet "${topic}", en suivant ce plan :
    ${outline}
    
    Consignes :
    - Ton professionnel mais accessible.
    - Utilise le format Markdown (titres, listes, gras).
    - Longueur environ 800-1200 mots.
    - Optimisé pour le SEO.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating draft:", error);
        throw error;
    }
}

export async function generateSeoMetadata(content: string): Promise<{ title: string; description: string; tags: string[] }> {
    try {
        const model = getGenerativeModel(ai, { model: MODEL_NAME });
        const prompt = `Analyse le contenu suivant et génère des métadonnées SEO.
    Contenu : ${content.substring(0, 2000)}... (tronqué)
    
    Réponds UNIQUEMENT avec un objet JSON valide (sans Markdown \`\`\`json) contenant :
    - "title" : un titre SEO optimisé (max 60 chars)
    - "description" : une méta-description (max 160 chars)
    - "tags" : un tableau de 5 à 8 mots-clés pertinents
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating SEO metadata:", error);
        return { title: "", description: "", tags: [] };
    }
}

// Placeholder for Image Generation
// Note: The JS SDK for Vertex AI in Firebase might not support Imagen directly yet in the same way.
// We might need to use a Cloud Function or a specific model call if supported.
export async function generateImage(prompt: string): Promise<string | null> {
    console.log("Image generation requested for:", prompt);
    // TODO: Implement actual image generation when supported or via Cloud Function
    // For now, return a placeholder or mock
    return null;
}
