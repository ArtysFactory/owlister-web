"use client";

import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole } from "@/lib/services/users";
import { UserProfile, UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ShieldAlert, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/lib/context/auth-context";

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error loading users", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleRoleChange(uid: string, newRole: UserRole) {
        if (updating) return;
        setUpdating(uid);
        try {
            await updateUserRole(uid, newRole);
            // Optimistic update
            setUsers(users.map(u => u.id === uid ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating role", error);
            alert("Erreur lors de la mise à jour du rôle");
        } finally {
            setUpdating(null);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-display">Utilisateurs</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des utilisateurs inscrits</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Aucun utilisateur trouvé.
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Utilisateur
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Rôle
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Inscrit le
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex items-center gap-2">
                                                    {user.photoURL ? (
                                                        <img
                                                            src={user.photoURL}
                                                            alt={user.displayName || "User"}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span>{user.displayName || "Sans nom"}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge
                                                    variant={user.role === "admin" ? "default" : "secondary"}
                                                    className="gap-1"
                                                >
                                                    {user.role === "admin" ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                                    {user.role === "admin" ? "Admin" : "Contributeur"}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {format(user.createdAt, "d MMMM yyyy", { locale: fr })}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {currentUser?.uid !== user.id && (
                                                    <div className="flex justify-end gap-2">
                                                        {user.role === "contributor" ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRoleChange(user.id, "admin")}
                                                                disabled={updating === user.id}
                                                            >
                                                                {updating === user.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                                Promouvoir Admin
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRoleChange(user.id, "contributor")}
                                                                disabled={updating === user.id}
                                                            >
                                                                {updating === user.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                                Rétrograder
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
