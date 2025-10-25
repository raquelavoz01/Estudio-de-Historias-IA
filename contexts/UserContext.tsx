import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, SubscriptionPlan } from '../types';

const USER_STORAGE_KEY = 'ia-story-studio-user';

interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    login: (email: string) => void;
    logout: () => void;
    signUp: (email: string, name: string) => void;
    selectPlan: (plan: SubscriptionPlan) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to load user from localStorage", error);
        } finally {
            setIsAuthLoading(false);
        }
    }, []);

    const updateUserStorage = (updatedUser: User | null) => {
        setUser(updatedUser);
        if (updatedUser) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    };

    const login = (email: string) => {
        // Simulação: em um app real, isso faria uma chamada de API.
        // Aqui, apenas criamos um usuário falso se ele não existir.
        const mockUser: User = {
            id: email.toLowerCase(), // Usar e-mail como ID para simplicidade
            email: email,
            name: 'Usuário',
            subscriptionPlan: 'free',
        };
        updateUserStorage(mockUser);
    };

    const signUp = (email: string, name: string) => {
         // Simulação
        const newUser: User = {
            id: email.toLowerCase(),
            email,
            name,
            subscriptionPlan: 'free', // Todos começam com o plano gratuito
        };
        updateUserStorage(newUser);
    };

    const logout = () => {
        updateUserStorage(null);
    };
    
    const selectPlan = (plan: SubscriptionPlan) => {
        if (user) {
            const updatedUser = { ...user, subscriptionPlan: plan };
            updateUserStorage(updatedUser);
        }
    };


    const value = {
        user,
        isAuthenticated: !!user,
        isAuthLoading,
        login,
        logout,
        signUp,
        selectPlan
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};