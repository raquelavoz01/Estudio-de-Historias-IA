import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../toast';
import { Button } from './Button';
import { PlayIcon, PauseIcon, ArrowPathIcon } from '../icons';

const FOCUS_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export const PomodoroTimer: React.FC = () => {
    const [time, setTime] = useState(FOCUS_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const toast = useToast();

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setIsBreak(false);
        setTime(FOCUS_TIME);
    }, []);

    useEffect(() => {
        // FIX: Replaced NodeJS.Timeout with `number` which is the correct type for setInterval in a browser environment.
        let interval: number | null = null;

        if (isActive && time > 0) {
            // FIX: Using `window.setInterval` explicitly calls the browser's implementation, which returns a `number` and resolves the type conflict with Node.js types.
            interval = window.setInterval(() => {
                setTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (isActive && time === 0) {
            if (isBreak) {
                toast.success("A pausa terminou. Hora de focar!");
                setIsBreak(false);
                setTime(FOCUS_TIME);
            } else {
                toast.info("Sessão de foco concluída! Faça uma pausa.");
                setIsBreak(true);
                setTime(BREAK_TIME);
            }
            // A reprodução de som requer interação do usuário, então uma notificação é mais confiável.
        }

        return () => {
            if (interval) {
                // FIX: Use `window.clearInterval` to match the `window.setInterval` call.
                window.clearInterval(interval);
            }
        };
    }, [isActive, time, isBreak, toast]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
            <div>
                <h3 className="font-bold text-white">{isBreak ? 'Pausa' : 'Sessão de Foco'}</h3>
                <p className="text-4xl font-mono font-bold text-cyan-400">{formatTime(time)}</p>
            </div>
            <div className="flex items-center space-x-2">
                <Button onClick={toggleTimer} variant="secondary" className="px-3 py-2">
                    {isActive ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                </Button>
                <Button onClick={resetTimer} variant="secondary" className="px-3 py-2">
                    <ArrowPathIcon className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};