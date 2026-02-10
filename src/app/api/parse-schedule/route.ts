import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        const now = new Date();

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // 합리적인 비용의 최신 모델
            messages: [
                {
                    role: "system",
                    content: `당신은 시니어를 돕는 일정 도우미입니다. 
          입력된 텍스트에서 [날짜, 시간, 할 일, 장소]를 추출하여 JSON 형식으로 응답하세요.
          상대적인 시간(내일, 이번주 토요일 등)은 현재 시간(${now.toISOString()})을 기준으로 절대 날짜로 변환하세요.
          시간이 없으면 null로 표시하세요.
          응답 형식: { "date": "YYYY-MM-DD", "time": "HH:mm" 또는 null, "title": "할일", "location": "장소" 또는 null }`
                },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" }
        });

        const parsedData = JSON.parse(response.choices[0].message.content || "{}");
        return NextResponse.json(parsedData);
    } catch (error) {
        console.error("AI Parsing Error:", error);
        return NextResponse.json({ error: "일정을 이해하지 못했어요." }, { status: 500 });
    }
}
