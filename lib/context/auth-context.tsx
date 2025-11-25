"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { UserProfile, UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
                    } else {
                        // Handle case where user exists in Auth but not Firestore
                        // For now, we can set a default profile or null
                        console.warn("User profile not found in Firestore");
                        setProfile(null);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        await firebaseSignOut(auth);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
