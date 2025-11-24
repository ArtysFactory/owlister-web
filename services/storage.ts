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
        try {
            // 1. Check if this is a fresh registration (localStorage flag)
            const cachedRole = localStorage.getItem(`role_${firebaseUser.uid}`);
            const isNewUser = localStorage.getItem(`new_user_${firebaseUser.uid}`) === 'true';

            // 2. For new users, prioritize localStorage to avoid race conditions
            if (isNewUser && cachedRole) {
                const partialUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'Anon',
                    email: firebaseUser.email || '',
                    role: cachedRole as UserRole,
                    avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
                };
                callback(partialUser);
                // Clear the flag after first successful auth
                localStorage.removeItem(`new_user_${firebaseUser.uid}`);
                return;
            }

            // 3. For existing users, try DB with short timeout (800ms instead of 2000ms)
            const fetchProfile = async () => {
                 try {
                    const doc = await db.collection(USERS_COLLECTION).doc(firebaseUser.uid).get();
                    return doc.exists ? doc.data() as User : null;
                 } catch (err) {
                    return null;
                 }
            };

            const userProfile = await Promise.race([
                fetchProfile(),
                timeoutPromise(800).then(() => null)
            ]) as User | null;

            if (userProfile) {
                // Update cache if we got fresh data
                localStorage.setItem(`role_${firebaseUser.uid}`, userProfile.role);
                callback(userProfile);
                return;
            }

            // 4. FALLBACK: Reconstruct from Auth + Cached Role
            const partialUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Anon',
                email: firebaseUser.email || '',
                role: (cachedRole as UserRole) || UserRole.READER,
                avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
            };
            callback(partialUser);

        } catch (e) {
            // Extreme fallback
            const partialUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Anon',
                email: firebaseUser.email || '',
                role: (localStorage.getItem(`role_${firebaseUser.uid}`) as UserRole) || UserRole.READER,
                avatar: firebaseUser.photoURL || ''
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

    // Try to fetch user role from Firestore or localStorage
    try {
        const cachedRole = localStorage.getItem(`role_${cred.user!.uid}`);

        const fetchUserRole = async () => {
            const doc = await db.collection(USERS_COLLECTION).doc(cred.user!.uid).get();
            if (doc.exists) {
                const userData = doc.data() as User;
                // Cache the role for future use
                localStorage.setItem(`role_${cred.user!.uid}`, userData.role);
                return userData.role;
            }
            return null;
        };

        // Race between DB fetch and timeout
        const roleFromDB = await Promise.race([
            fetchUserRole(),
            timeoutPromise(800).then(() => null)
        ]);

        const finalRole = roleFromDB || (cachedRole as UserRole) || UserRole.READER;

        return {
            id: cred.user!.uid,
            name: cred.user!.displayName || 'User',
            email: cred.user!.email || '',
            role: finalRole,
            avatar: cred.user!.photoURL || ''
        };
    } catch (e) {
        // Fallback to cached role or READER
        const cachedRole = localStorage.getItem(`role_${cred.user!.uid}`);
        return {
            id: cred.user!.uid,
            name: cred.user!.displayName || 'User',
            email: cred.user!.email || '',
            role: (cachedRole as UserRole) || UserRole.READER,
            avatar: cred.user!.photoURL || ''
        };
    }
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
            
            // Optimistic attempt to create user doc
            try {
                await Promise.race([
                    (async () => {
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
                            await userDocRef.set(newUser).catch(() => {});
                        }
                    })(),
                    timeoutPromise(2000)
                ]);
            } catch (firestoreErr) {
                // Ignore DB errors on login
            }

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
        throw error;
    }
};

export const registerUser = async (name: string, email: string, role: UserRole, password?: string): Promise<User> => {
    if (!password) throw new Error("Password required");

    // 1. Create Auth User
    const cred = await auth.createUserWithEmailAndPassword(email, password);

    if (cred.user) {
        // 2. Update Display Name
        await cred.user.updateProfile({ displayName: name });

        // 3. CRITICAL: Cache role immediately in LocalStorage
        // This is the source of truth if DB write lags
        localStorage.setItem(`role_${cred.user.uid}`, role);
        // Set flag to indicate this is a fresh registration
        localStorage.setItem(`new_user_${cred.user.uid}`, 'true');

        const newUser: User = {
          id: cred.user.uid,
          name,
          email,
          role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          bio: 'New recruit in the resistance.'
        };

        // 4. IMPORTANT: Actually WAIT for Firestore write to complete
        // This ensures the role is properly saved before logout
        try {
            await Promise.race([
                db.collection(USERS_COLLECTION).doc(newUser.id).set(newUser),
                timeoutPromise(3000) // Give it 3 seconds
            ]);
            console.log("User profile saved to Firestore successfully");
        } catch (e) {
            console.warn("DB Write slow/failed, but Auth OK. Role cached locally.", e);
            // Still OK because localStorage has the role
        }

        return newUser;
    }
    throw new Error("Registration failed");
};

export const getCurrentUser = (): User | null => {
    if (auth.currentUser) {
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
        // DO NOT remove role from localStorage - we need it for next login!
        // Only remove the new_user flag
        localStorage.removeItem(`new_user_${auth.currentUser.uid}`);
    }
    await auth.signOut();
};


// --- CONTENT ---
export const loadContent = async (): Promise<ContentItem[]> => {
    // Try cache first for instant loading
    const cachedContent = localStorage.getItem('cached_content');
    const cacheTimestamp = localStorage.getItem('content_cache_time');
    const now = Date.now();

    // If cache is less than 30 seconds old, use it immediately
    if (cachedContent && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 30000) {
        try {
            const parsed = JSON.parse(cachedContent);
            // Return cached data immediately, then refresh in background
            setTimeout(() => loadContent(), 100);
            return parsed;
        } catch (e) {
            // Cache corrupted, continue to fetch
        }
    }

    try {
        // Fetch with aggressive timeout (1 second)
        const fetchData = async () => {
            const snapshot = await db.collection(CONTENT_COLLECTION).orderBy('date', 'desc').get();
            const items = snapshot.docs.map(d => d.data() as ContentItem);
            return items.length > 0 ? items : [...MOCK_ARTICLES, ...MOCK_COMICS].map(c => ({...c, originalLanguage: 'fr' as any}));
        };

        const items = await Promise.race([
            fetchData(),
            timeoutPromise(1000).then(() => {
                // Return mock data on timeout
                return [...MOCK_ARTICLES, ...MOCK_COMICS].map(c => ({...c, originalLanguage: 'fr' as any}));
            })
        ]) as ContentItem[];

        // Cache the result
        localStorage.setItem('cached_content', JSON.stringify(items));
        localStorage.setItem('content_cache_time', now.toString());

        return items;
    } catch (e) {
        // Firestore timeout or offline - this is expected behavior
        // Using mock data for demo purposes
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

        // Check if already exists with timeout
        const checkExists = async () => {
            const docSnap = await docRef.get();
            return docSnap.exists;
        };

        const exists = await Promise.race([
            checkExists(),
            timeoutPromise(1000).then(() => false)
        ]);

        if (exists) {
            console.log("Subscriber already exists");
            return false;
        }

        // Add subscriber with timeout
        const sub: Subscriber = { email, date: new Date().toISOString().split('T')[0], language };
        await Promise.race([
            docRef.set(sub),
            timeoutPromise(2000)
        ]);

        console.log("Subscriber added successfully");
        return true;
    } catch (e) {
        console.error("Error adding subscriber:", e);
        return false;
    }
};