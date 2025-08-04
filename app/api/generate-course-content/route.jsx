import { NextResponse } from "next/server";
import {
    GoogleGenAI,
  } from '@google/genai';

import axios from "axios";
import { coursesTable } from "../../../config/schema";
import { db } from "../../../config/db";
import { eq } from "drizzle-orm";

const PROMPT = `
Based on the chapter name and topics, generate HTML content for each topic. 
Respond with valid JSON in this format:
Schema:
{
  chapterName:<>,
  {
  topics: <>,
  content:<>
}
}
:

User Input:
`;


export async function POST(req) {
  // try {export async function POST(req) {
  try {
    const body = await req.json();
    const { courseJson, courseTitle, courseId } = body;

    const promises = courseJson?.chapters?.map(async(chapter)=>{
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
          });
        const config = {
        responseMimeType: 'text/plain',
      };
      const model = 'gemini-2.0-flash';
      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: PROMPT+ JSON.stringify(chapter),
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model,
        config,
        contents,
      });

      const RawResp = response?.candidates[0]?.content.parts[0]?.text;
      const RawJson = RawResp.replace('```json','').replace('```','').trim();
      const JSONResp = JSON.parse(RawJson);
      console.log('json resp',JSONResp);

      //Get Youtube Video

      const youtubeData = await GetYoutubeVideo(chapter?.chapterName);
      console.log({
        youtubeVideo:youtubeData,
        courseData:JSONResp
      });
      return {
        youtubeVideo:youtubeData,
        courseData:JSONResp
      };
    })
    
    const CourseContent = await Promise.all(promises);

    // save to database
    const dbResp = await db.update(coursesTable).set({
      courseContent:CourseContent
    }).where(eq(coursesTable.cid,courseId));


    return NextResponse.json({
      courseName:courseTitle,
      CourseContent:CourseContent
    });
  }catch (error) {
    console.error("Error in generateCourseContent API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";
const GetYoutubeVideo =async (topic)=>{

  const params={
    part:'snippet',
    q:topic,
    maxResults:4,
    type:'video',
    key:process.env.YOUTUBE_API_KEY,
  };
  const resp = await axios.get(YOUTUBE_BASE_URL,{params});
  const youtubeVideoListResp = resp.data.items;
  const youtubeVideoList = [];
  youtubeVideoListResp.forEach(item=>{
    const data = {
      videoId:item.id?.videoId,
      title:item?.snippet?.title
    }
    console.log(youtubeVideoList);
    youtubeVideoList.push(data);
  })
  return youtubeVideoList;
}
// const GetYoutubeVideo = async (topic) => {
//   try {
//     if (!process.env.YOUTUBE_API_KEY) {
//       console.error("Missing YOUTUBE_API_KEY in environment variables.");
//       return [];
//     }

//     const params = {
//       part: "snippet",
//       q: topic,
//       maxResults: 4,
//       type: "video",
//       key: process.env.YOUTUBE_API_KEY,
//     };

//     const resp = await axios.get(YOUTUBE_BASE_URL, { params });

//     // Inspect entire payload
//     console.log("YouTube raw response payload:", JSON.stringify(resp.data, null, 2));

//     const items = Array.isArray(resp.data.items) ? resp.data.items : [];
//     const youtubeVideoList = items.map((item) => ({
//       videoId: item?.id?.videoId,
//       title: item?.snippet?.title,
//     }));

//     console.log(`YouTube returned ${youtubeVideoList.length} items for "${topic}".`);
//     return youtubeVideoList;
//   } catch (err) {
//     // If axios error, print more detail if available
//     const detail = err.response?.data || err.message;
//     console.error(`YouTube API error for topic "${topic}":`, detail);
//     return [];
//   }
// };


//line 61-137
// if (!courseJson?.chapters || courseJson.chapters.length === 0) {
    //   return NextResponse.json(
    //     { error: "Invalid course data: No chapters found." },
    //     { status: 400 }
    //   );
    // }

    // const model = "gemini-2.0-flash";

    // const courseContent = await Promise.all(
    //   courseJson.chapters.map(async (chapter, idx) => {
    //     try {
    //       console.log(`\n--- Processing chapter #${idx + 1}: "${chapter.chapterName}" ---`);

    //       if (!chapter.topics || chapter.topics.length === 0) {
    //         throw new Error(`Chapter "${chapter.chapterName}" has no topics defined.`);
    //       }

    //       // 1) Call Gemini AI
    //       console.log("Calling Gemini AI with prompt:", PROMPT + JSON.stringify(chapter));
    //       const aiResponse = await ai.models.generateContent({
    //         model,
    //         config: { responseMimeType: "text/plain" },
    //         contents: [{ role: "user", parts: [{ text: PROMPT + JSON.stringify(chapter) }] }],
    //       });

    //       const raw = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    //       console.log("AI raw response:", raw);

    //       const cleaned = raw.replace(/```json|```/g, "").trim();
    //       let parsed;
    //       try {
    //         parsed = JSON.parse(cleaned);
    //         console.log("Parsed courseData:", parsed);
    //       } catch (jsonErr) {
    //         console.error("JSON parsing failed:", cleaned);
    //         throw new Error("Invalid JSON from AI response");
    //       }

    //       // 2) Call YouTube API
    //       console.log(`Calling YouTube API for topic: "${chapter.chapterName}"`);
    //       const youtubeData = await GetYoutubeVideo(chapter.chapterName);
    //       console.log("YouTube results:", youtubeData);

    //       return {
    //         youtubeVideo: youtubeData,
    //         courseData: parsed,
    //       };
    //     } catch (chapErr) {
    //       console.error(`Error in chapter "${chapter.chapterName}":`, chapErr);
    //       // Fallback so one bad chapter doesn't kill the whole batch
    //       return {
    //         youtubeVideo: [],
    //         courseData: { chapterName: chapter.chapterName, topics: [] },
    //       };
    //     }
    //   })
    // );

    // Save to DB
  //   await db
  //     .update(coursesTable)
  //     .set({ courseContent })
  //     .where(eq(coursesTable.cid, courseId));

  //   return NextResponse.json({
  //     courseName: courseTitle,
  //     courseId,
  //     courseContent,
  //   });
  // } catch (err) {
  //   console.error("Full error:", err);
  //   return NextResponse.json(
  //     { error: err?.message || "Internal Server Error" },
  //     { status: 500 }
  //   );
  // }