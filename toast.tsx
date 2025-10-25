import React, { createContext, useState, useCallback, ReactNode, useContext, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(message.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [message, onDismiss]);

    const baseClasses = 'relative w-full max-w-sm p-4 mb-4 rounded-md shadow-lg text-white flex items-center';
    const typeClasses = {
        success: 'bg-green-600/90 border border-green-700/50',
        error: 'bg-red-600/90 border border-red-700/50',
        info: 'bg-blue-600/90 border border-blue-700/50',
    };
    
    const iconPaths = {
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    }

    return (
        <div className={`${baseClasses} ${typeClasses[message.type]}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPaths[message.type]} /></svg>
            <span className="flex-grow">{message.message}</span>
            <button onClick={() => onDismiss(message.id)} className="ml-4 p-1 rounded-full hover:bg-white/20 text-xl font-bold leading-none">&times;</button>
        </div>
    );
};


const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-5 right-5 z-50">
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};


export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(currentToasts => [...currentToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  const toast = {
      success: (message: string) => context.addToast(message, 'success'),
      error: (message: string) => context.addToast(message, 'error'),
      info: (message: string) => context.addToast(message, 'info'),
  }

  return toast;
};