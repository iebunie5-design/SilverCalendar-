import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getTodayEvents } from "@/services/googleCalendar";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const events = await getTodayEvents(session.accessToken);
        return NextResponse.json(events);
    } catch (error) {
        console.error("Fetch Events API Error:", error);
        return NextResponse.json({ error: "일정을 불러오지 못했습니다." }, { status: 500 });
    }
}
