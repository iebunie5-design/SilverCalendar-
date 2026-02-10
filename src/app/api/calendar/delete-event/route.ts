import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { deleteCalendarEvent } from "@/services/googleCalendar";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const { eventId } = await req.json();
        await deleteCalendarEvent(session.accessToken, eventId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Event API Error:", error);
        return NextResponse.json({ error: "일정을 삭제하지 못했습니다." }, { status: 500 });
    }
}
