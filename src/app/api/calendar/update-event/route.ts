import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { updateCalendarEvent } from "@/services/googleCalendar";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const { eventId, ...eventDetails } = await req.json();
        const result = await updateCalendarEvent(session.accessToken, eventId, eventDetails);
        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("Update Event API Error:", error);
        return NextResponse.json({ error: "일정을 수정하지 못했습니다." }, { status: 500 });
    }
}
