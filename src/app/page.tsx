"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Mic, Camera, Calendar, LogIn, User, Loader2, Check, X, MapPin, Clock, Trash2, Edit2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

interface ParsedSchedule {
    eventId?: string; // 수정 시 필요
    date: string;
    time: string | null;
    title: string;
    location: string | null;
}

interface CalendarEvent {
    id: string;
    summary: string;
    start: { dateTime?: string; date?: string };
    location?: string;
}

export default function Home() {
    const { data: session } = useSession();
    const { isListening, transcript, startListening, stopListening } = useVoice();

    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [parsedSchedule, setParsedSchedule] = useState<ParsedSchedule | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    // 오늘 일정 가져오기
    const fetchEvents = useCallback(async () => {
        if (!session) return;
        setIsLoadingEvents(true);
        try {
            const res = await fetch("/api/calendar/get-events");
            if (res.ok) {
                const data = await res.json();
                setTodayEvents(data);
            }
        } catch (err) {
            console.error("Failed to fetch events:", err);
        } finally {
            setIsLoadingEvents(false);
        }
    }, [session]);

    useEffect(() => {
        if (session) fetchEvents();
    }, [session, fetchEvents]);

    useEffect(() => {
        if (transcript && !isListening) handleParse(transcript);
    }, [transcript, isListening]);

    const handleParse = async (text: string) => {
        setIsParsing(true);
        setError(null);
        try {
            const res = await fetch("/api/parse-schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setParsedSchedule(data);
        } catch (err) {
            setError("죄송해요, 일정을 알아듣지 못했어요. 다시 말씀해 주시겠어요?");
        } finally {
            setIsParsing(false);
        }
    };

    const handleSaveToCalendar = async () => {
        if (!parsedSchedule) return;
        setIsSaving(true);
        setError(null);
        try {
            const isUpdate = !!parsedSchedule.eventId;
            const url = isUpdate ? "/api/calendar/update-event" : "/api/calendar/add-event";

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsedSchedule),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setSuccess(true);
            setParsedSchedule(null);
            fetchEvents();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError("죄송해요, 캘린더 작업에 실패했어요. 다시 한번 해보시겠어요?");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm("정말 이 일정을 지울까요?")) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/calendar/delete-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId }),
            });
            if (res.ok) {
                fetchEvents();
            } else {
                throw new Error();
            }
        } catch (err) {
            setError("일정을 지우지 못했어요.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartEdit = (event: CalendarEvent) => {
        // 기존 이벤트를 분석 형식으로 변환하여 수정창 띄우기
        const startDate = event.start.dateTime || event.start.date || "";
        const datePart = startDate.split('T')[0];
        const timePart = startDate.includes('T') ? startDate.split('T')[1].substring(0, 5) : null;

        setParsedSchedule({
            eventId: event.id,
            title: event.summary,
            date: datePart,
            time: timePart,
            location: event.location || null
        });
    };

    const formatTime = (dateTimeStr?: string) => {
        if (!dateTimeStr) return "시간 미정";
        const date = new Date(dateTimeStr);
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <div style={{ paddingBottom: '100px' }}>
            <header style={{ textAlign: 'center', padding: '40px 0' }}>
                <h1 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>실버 캘린더</h1>
                {session ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <User size={24} color="#666" />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{session.user?.name}님</span>
                    </div>
                ) : (
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>간편하게 말로 일정을 등록하세요</p>
                )}
            </header>

            <div style={{ display: 'grid', gap: '24px' }}>
                {session ? (
                    <>
                        <button className="primary-button" style={{ height: '150px', fontSize: '1.8rem', flexDirection: 'column' }} onClick={startListening}>
                            <Mic size={48} /> 말하기로 등록
                        </button>
                        <button className="secondary-button" style={{ height: '150px', fontSize: '1.8rem', flexDirection: 'column' }}>
                            <Camera size={48} /> 사진으로 등록
                        </button>
                    </>
                ) : (
                    <button className="primary-button" style={{ height: '120px', fontSize: '1.5rem', backgroundColor: '#4285F4' }} onClick={() => signIn('google')}>
                        <LogIn size={32} /> 구글로 로그인하고 시작하기
                    </button>
                )}

                <div className="card" style={{ marginTop: '30px' }}>
                    <h2 style={{ fontSize: '1.6rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={28} color="var(--primary-color)" /> 오늘의 일정
                    </h2>
                    {isLoadingEvents ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="spin" /></div>
                    ) : todayEvents.length > 0 ? (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {todayEvents.map((event) => (
                                <div key={event.id} style={{ padding: '20px', background: '#f8f9fa', borderRadius: '16px', borderLeft: '8px solid var(--primary-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>{event.summary}</div>
                                        <div style={{ display: 'flex', gap: '15px', color: '#666' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={18} /> {formatTime(event.start.dateTime)}</span>
                                            {event.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={18} /> {event.location}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleStartEdit(event)} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #ccc', background: 'white' }}>
                                            <Edit2 size={24} color="#007bff" />
                                        </button>
                                        <button onClick={() => handleDelete(event.id)} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #ffcccc', background: 'white' }}>
                                            <Trash2 size={24} color="#dc3545" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '40px 20px', border: '2px dashed #eee', borderRadius: '20px', textAlign: 'center', color: '#aaa' }}>
                            {session ? '오늘은 일정이 없어요. 하나 등록해 볼까요?' : '로그인이 필요합니다.'}
                        </div>
                    )}
                </div>
            </div>

            {/* 오버레이들 */}
            {(isListening || isParsing || isSaving) && (
                <div className="overlay">
                    <div className="popup-card">
                        {isListening ? (
                            <><div className="pulse-mic"><Mic size={64} color="white" /></div><h2 style={{ fontSize: '2rem', marginTop: '30px' }}>듣고 있어요...</h2></>
                        ) : (
                            <><Loader2 size={64} className="spin" color="var(--primary-color)" /><h2 style={{ fontSize: '2rem', marginTop: '30px' }}>잠시만 기다려 주세요...</h2></>
                        )}
                    </div>
                </div>
            )}

            {success && (
                <div className="overlay">
                    <div className="popup-card" style={{ textAlign: 'center' }}>
                        <div style={{ background: 'var(--accent-color)', padding: '20px', borderRadius: '50%' }}><Check size={64} color="white" /></div>
                        <h2 style={{ fontSize: '2rem', marginTop: '30px' }}>완료되었습니다!</h2>
                    </div>
                </div>
            )}

            {error && (
                <div className="overlay"><div className="popup-card"><X size={64} color="var(--error-color)" /><h2 style={{ fontSize: '1.6rem', margin: '30px 0', textAlign: 'center' }}>{error}</h2><button className="primary-button" onClick={() => setError(null)} style={{ width: '100%' }}>확인</button></div></div>
            )}

            {parsedSchedule && !isParsing && !isSaving && (
                <div className="overlay">
                    <div className="popup-card">
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: 'var(--primary-color)' }}>{parsedSchedule.eventId ? "내용을 고칠까요?" : "내용이 맞나요?"}</h2>
                        <div style={{ textAlign: 'left', width: '100%', background: '#f0f4f8', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '16px' }}>{parsedSchedule.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '8px' }}><Calendar size={24} /> {parsedSchedule.date}</div>
                            {parsedSchedule.time && <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '8px' }}><Clock size={24} /> {parsedSchedule.time}</div>}
                            {parsedSchedule.location && <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}><MapPin size={24} /> {parsedSchedule.location}</div>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', width: '100%' }}>
                            <button className="secondary-button" onClick={() => setParsedSchedule(null)} style={{ background: '#ccc' }}><X /> 취소</button>
                            <button className="primary-button" onClick={handleSaveToCalendar}><Check /> {parsedSchedule.eventId ? "고치기 완료" : "네, 맞아요!"}</button>
                        </div>
                    </div>
                </div>
            )}

            <footer style={{ marginTop: '40px', textAlign: 'center' }}>
                {session && <button onClick={() => signOut()} style={{ color: '#888', textDecoration: 'underline' }}>로그아웃</button>}
            </footer>

            <style jsx global>{`
        .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 1000; }
        .popup-card { background: white; width: 100%; max-width: 500px; padding: 40px; border-radius: 32px; display: flex; flex-direction: column; align-items: center; }
        .pulse-mic { background: var(--primary-color); padding: 30px; border-radius: 50%; animation: pulse 1.5s infinite; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); } 70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(0, 123, 255, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
