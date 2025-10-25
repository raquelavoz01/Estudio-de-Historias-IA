import React, { useState } from 'react';
import { Button } from './Button';
import { useToast } from '../../toast';
import { useUser } from '../../contexts/UserContext';
import { SubscriptionPlan } from '../../types';

interface CheckoutButtonProps {
    priceId: string;
    planName: string;
    variant: 'primary' | 'secondary';
    isCurrentPlan: boolean;
    planId: SubscriptionPlan; // Prop adicionada para saber qual plano está sendo comprado
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({ priceId, planName, variant, isCurrentPlan, planId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const { user } = useUser();

    const handleCheckout = async () => {
        setIsLoading(true);
        toast.info("Redirecionando para o checkout seguro...");
        
        try {
            // Armazena o plano que está sendo comprado para atualizar o contexto após o redirecionamento bem-sucedido
            sessionStorage.setItem('pendingPlan', planId);
            
            // Chame seu próprio backend para criar a sessão.
            const response = await fetch('http://localhost:4242/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Inclua tokens de autenticação se necessário. Ex:
                    // 'Authorization': `Bearer ${user?.authToken}`
                },
                body: JSON.stringify({ priceId: priceId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao se comunicar com o servidor.');
            }

            const session = await response.json(); // Espera-se { url: 'https://checkout.stripe.com/...' }

            // Redirecione o usuário para a página de pagamento do Stripe.
            window.location.href = session.url;

        } catch (error) {
            sessionStorage.removeItem('pendingPlan'); // Limpa em caso de erro
            console.error("Falha ao criar a sessão de checkout:", error);
            const errorMessage = error instanceof Error ? error.message : "Não foi possível iniciar o checkout. Verifique se o seu servidor backend está rodando.";
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    if (isCurrentPlan) {
        return (
            <Button className="w-full" disabled={true}>
                Plano Ativo
            </Button>
        );
    }

    return (
        <Button 
            className="w-full" 
            variant={variant} 
            onClick={handleCheckout}
            isLoading={isLoading}
        >
            Selecionar Plano {planName}
        </Button>
    );
};
