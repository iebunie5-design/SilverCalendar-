import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { addCalendarEvent } from "@/services/googleCalendar";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "로그인이 풀렸어요. 다시 로그인해 주세요." }, { status: 401 });
    }

    try {
        const eventDetails = await req.json();
        const result = await addCalendarEvent(session.accessToken, eventDetails);
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error("Calendar API Detailed Error:", error.response?.data || error.message);

        if (error.code === 403 || (error.message && error.message.includes('insufficent'))) {
            return NextResponse.json({
                error: "구글 캘린더 사용 허락이 필요해요. 로그아웃 후 다시 로그인할 때 '캘린더 관리'를 꼭 눌러주세요!"
            }, { status: 403 });
        }

        return NextResponse.json({ error: "일정을 저장하는 중에 문제가 생겼어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
    }
}
