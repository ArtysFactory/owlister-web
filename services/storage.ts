import { ContentItem, Comment, Subscriber, User, UserRole, ContentType, Article, Comic } from "../types";
import { MOCK_ARTICLES, MOCK_COMICS } from "../constants";
import { db, auth, storage } from "../firebaseConfig";
import firebase from 'firebase/compat/app';

const CONTENT_COLLECTION = 'content';
const USERS_COLLECTION = 'users';
const COMMENTS_COLLECTION = 'comments';
const SUBS_COLLECTION = 'subscribers';

// Helper to prevent infinite hanging
const timeoutPromise = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

// --- USERS / AUTH ---

export const checkAuthState = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
        let userProfile: User | null = null;
        
        try {
            // Fetch profile with error swallowing
            const fetchProfile = async () => {
                 try {
                    const doc = await db.collection(USERS_COLLECTION).doc(firebaseUser.uid).get();
                    return doc.exists ? doc.data() as User : null;
                 } catch (err) {
                    console.warn("DB Read Error (Offline?):", err);
                    return null; // Return null to fallback to basic auth
                 }
            };

            // Race between DB fetch and a short timeout. 
            userProfile = await Promise.race([
                fetchProfile(),
                timeoutPromise(2000).then(() => null)
            ]) as User | null;

        } catch (e) {
            console.warn("Auth check timed out or failed, using basic profile.");
        }

        if (userProfile) {
            // Update local cache with fresh data from DB
            localStorage.setItem(`role_${firebaseUser.uid}`, userProfile.role);
            callback(userProfile);
        } else {
             // Fallback: Reconstruct from Auth data immediately
             // IMPORTANT: Check LocalStorage for the Role to prevent reverting to READER
            const cachedRole = localStorage.getItem(`role_${firebaseUser.uid}`);
            
            const partialUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Anon',
                email: firebaseUser.email || '',
                role: (cachedRole as UserRole) || UserRole.READER,
                avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
            };
            callback(partialUser);
        }
    } else {
        callback(null);
    }
  });
}

export const loginUser = async (email: string, password?: string): Promise<User | null> => {
    if (!password) throw new Error("Password required");
    const cred = await auth.signInWithEmailAndPassword(email, password);
    // Return a basic object immediately, let checkAuthState handle the rest
    return {
        id: cred.user!.uid,
        name: cred.user!.displayName || 'User',
        email: cred.user!.email || '',
        role: UserRole.READER, // Role will be updated by checkAuthState via DB or Cache
        avatar: cred.user!.photoURL || ''
    };
};

export const loginWithProvider = async (providerName: 'google' | 'apple' | 'linkedin'): Promise<User | null> => {
    let provider: firebase.auth.AuthProvider;

    switch (providerName) {
        case 'google':
            provider = new firebase.auth.GoogleAuthProvider();
            break;
        case 'apple':
            provider = new firebase.auth.OAuthProvider('apple.com');
            break;
        case 'linkedin':
            provider = new firebase.auth.OAuthProvider('oidc.linkedin');
            break;
        default:
            throw new Error("Unknown provider");
    }

    try {
        const result = await auth.signInWithPopup(provider);
        if (result.user) {
            const userDocRef = db.collection(USERS_COLLECTION).doc(result.user.uid);
            
            // Try to create/get user doc with timeout and error swallowing
            try {
                await Promise.race([
                    (async () => {
                        try {
                            const userDoc = await userDocRef.get();
                            if (!userDoc.exists) {
                                const newUser: User = {
                                    id: result.user!.uid,
                                    name: result.user!.displayName || 'Nomad',
                                    email: result.user!.email || '',
                                    role: UserRole.READER,
                                    avatar: result.user!.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user!.uid}`,
                                    bio: 'Connected via social network.'
                                };
                                await userDocRef.set(newUser).catch(e => console.warn("Write failed", e));
                            }
                        } catch (e) {
                            console.warn("Firestore error during provider login", e);
                        }
                    })(),
                    timeoutPromise(3000)
                ]);
            } catch (firestoreErr) {
                console.warn("Firestore slow during provider login, proceeding anyway.");
            }

            // Return basic auth info regardless of DB success
            return {
                id: result.user.uid,
                name: result.user.displayName || 'Nomad',
                email: result.user.email || '',
                role: UserRole.READER,
                avatar: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`,
                bio: 'Offline Mode'
            };
        }
        return null;
    } catch (error: any) {
        console.error("Provider login error:", error);
        throw error;
    }
};

export const registerUser = async (name: string, email: string, role: UserRole, password?: string): Promise<User> => {
    if (!password) throw new Error("Password required");
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    if (cred.user) {
        await cred.user.updateProfile({ displayName: name });
        
        // IMPORTANT: Save role to LocalStorage immediately so checkAuthState can find it
        // even if DB write fails or is slow
        localStorage.setItem(`role_${cred.user.uid}`, role);

        const newUser: User = {
          id: cred.user.uid,
          name,
          email,
          role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          bio: 'New recruit in the resistance.'
        };
        
        // Try to save to DB but don't block registration if it fails/hangs
        try {
            // Using .set().catch() explicitly to prevent unhandled rejection
            db.collection(USERS_COLLECTION).doc(newUser.id).set(newUser).catch(e => {
                console.warn("Offline: Could not save full profile to DB, but Auth created.");
            });
        } catch (e) {
            console.warn("Could not save full profile to DB (likely offline), but Auth created.");
        }
        
        return newUser;
    }
    throw new Error("Registration failed");
};

export const getCurrentUser = (): User | null => {
    if (auth.currentUser) {
        // Try to recover role from cache if possible
        const cachedRole = localStorage.getItem(`role_${auth.currentUser.uid}`);
        return {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || 'User',
            email: auth.currentUser.email || '',
            role: (cachedRole as UserRole) || UserRole.READER,
            avatar: auth.currentUser.photoURL || ''
        }
    }
    return null;
};

export const logoutUser = async () => {
    if (auth.currentUser) {
        localStorage.removeItem(`role_${auth.currentUser.uid}`);
    }
    await auth.signOut();
};


// --- CONTENT ---
export const loadContent = async (): Promise<ContentItem[]> => {
    try {
        const snapshot = await db.collection(CONTENT_COLLECTION).orderBy('date', 'desc').get();
        const items = snapshot.docs.map(d => d.data() as ContentItem);
        if (items.length === 0) return [...MOCK_ARTICLES, ...MOCK_COMICS].map(c => ({...c, originalLanguage: 'fr' as any}));
        return items;
    } catch (e) {
        // Fallback to mocks if offline or empty
        return [...MOCK_ARTICLES, ...MOCK_COMICS].map(c => ({...c, originalLanguage: 'fr' as any}));
    }
};

export const saveContentItem = async (item: ContentItem) => {
    await db.collection(CONTENT_COLLECTION).doc(item.id).set(item);
};

export const deleteContentItem = async (id: string) => {
    await db.collection(CONTENT_COLLECTION).doc(id).delete();
    return loadContent();
};

export const uploadImageFile = async (file: File, path: string): Promise<string> => {
    const storageRef = storage.ref(path);
    await storageRef.put(file);
    return storageRef.getDownloadURL();
}

// --- COMMENTS ---
export const loadComments = async (contentId?: string): Promise<Comment[]> => {
    try {
        let q: any = db.collection(COMMENTS_COLLECTION);
        if (contentId) {
            q = q.where("contentId", "==", contentId);
        }
        const snapshot = await q.get();
        const comments = snapshot.docs.map((d: any) => d.data() as Comment);
        return comments.sort((a: Comment, b: Comment) => b.date.localeCompare(a.date));
    } catch (e) {
        return [];
    }
};

export const saveComment = async (comment: Comment) => {
    await db.collection(COMMENTS_COLLECTION).doc(comment.id).set(comment);
};

export const deleteComment = async (id: string) => {
    await db.collection(COMMENTS_COLLECTION).doc(id).delete();
    return loadComments();
};

// --- SUBSCRIBERS ---
export const loadSubscribers = async (): Promise<Subscriber[]> => {
    try {
        const snapshot = await db.collection(SUBS_COLLECTION).get();
        return snapshot.docs.map(d => d.data() as Subscriber);
    } catch (e) {
        return [];
    }
};

export const addSubscriber = async (email: string, language: 'fr'|'en'|'es' = 'fr') => {
    try {
        const docRef = db.collection(SUBS_COLLECTION).doc(email);
        const docSnap = await docRef.get();
        if (docSnap.exists) return false;
        const sub: Subscriber = { email, date: new Date().toISOString().split('T')[0], language };
        await docRef.set(sub);
        return true;
    } catch (e) {
        return false;
    }
};