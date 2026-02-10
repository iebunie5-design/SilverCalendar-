import { google } from "googleapis";

/**
 * 구글 캘린더에 일정을 추가하는 서비스 함수
 */
export const addCalendarEvent = async (accessToken: string, eventDetails: { title: string; date: string; time: string | null; location: string | null }) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    const startDateTime = eventDetails.time
        ? `${eventDetails.date}T${eventDetails.time}:00`
        : `${eventDetails.date}T09:00:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

    const event = {
        summary: eventDetails.title,
        location: eventDetails.location || "",
        description: "실버 캘린더에서 등록된 일정입니다.",
        start: { dateTime: new Date(startDateTime).toISOString(), timeZone: "Asia/Seoul" },
        end: { dateTime: endDateTime, timeZone: "Asia/Seoul" },
    };

    try {
        const response = await calendar.events.insert({ calendarId: "primary", requestBody: event });
        return response.data;
    } catch (error) {
        console.error("Google Calendar Insert Error:", error);
        throw error;
    }
};

/**
 * 오늘의 일정을 가져오는 서비스 함수
 */
export const getTodayEvents = async (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    // 한국 시간(KST)으로 현재 날짜 문자열 생성 (YYYY-MM-DD)
    const kstDateString = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now);

    const startOfDay = `${kstDateString}T00:00:00+09:00`;
    const endOfDay = `${kstDateString}T23:59:59+09:00`;

    try {
        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: startOfDay,
            timeMax: endOfDay,
            singleEvents: true,
            orderBy: "startTime",
        });
        return response.data.items || [];
    } catch (error) {
        console.error("Google Calendar List Error:", error);
        throw error;
    }
};

/**
 * 일정 삭제 서비스 함수
 */
export const deleteCalendarEvent = async (accessToken: string, eventId: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    try {
        await calendar.events.delete({ calendarId: "primary", eventId });
        return { success: true };
    } catch (error) {
        console.error("Google Calendar Delete Error:", error);
        throw error;
    }
};

/**
 * 일정 수정 서비스 함수
 */
export const updateCalendarEvent = async (accessToken: string, eventId: string, eventDetails: { title: string; date: string; time: string | null; location: string | null }) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    const startDateTime = eventDetails.time
        ? `${eventDetails.date}T${eventDetails.time}:00`
        : `${eventDetails.date}T09:00:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

    const event = {
        summary: eventDetails.title,
        location: eventDetails.location || "",
        start: { dateTime: new Date(startDateTime).toISOString(), timeZone: "Asia/Seoul" },
        end: { dateTime: endDateTime, timeZone: "Asia/Seoul" },
    };

    try {
        const response = await calendar.events.patch({ calendarId: "primary", eventId, requestBody: event });
        return response.data;
    } catch (error) {
        console.error("Google Calendar Update Error:", error);
        throw error;
    }
};
