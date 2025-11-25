import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(file: File, path: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const filename = `${uuidv4()}.${ext}`;
    const storageRef = ref(storage, `${path}/${filename}`);

    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

export async function deleteImage(url: string): Promise<void> {
    try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
    } catch (error) {
        console.error("Error deleting image", error);
    }
}
