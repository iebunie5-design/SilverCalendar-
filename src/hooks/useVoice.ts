"use client";

import { useState, useCallback, useEffect } from "react";

export const useVoice = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = false; // 한 문장씩 전달
                recognitionInstance.interimResults = false; // 최종 결과만 사용
                recognitionInstance.lang = "ko-KR"; // 한국어 설정

                recognitionInstance.onstart = () => setIsListening(true);
                recognitionInstance.onend = () => setIsListening(false);
                recognitionInstance.onresult = (event: any) => {
                    const currentTranscript = event.results[0][0].transcript;
                    setTranscript(currentTranscript);
                };

                setRecognition(recognitionInstance);
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition) {
            setTranscript("");
            recognition.start();
        } else {
            alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
        }
    }, [recognition]);

    return { isListening, transcript, startListening, stopListening, setTranscript };
};
