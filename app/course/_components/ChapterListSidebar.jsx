import React, { useContext } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion"
import { SelectedChapterIndexContext } from '../../../context/SelectedChapterIndexContext';
import { CheckCircle } from 'lucide-react';

function ChapterListSidebar({courseInfo}) {
    const course = courseInfo?.courses;
    const enrollCourse = courseInfo?.enrollCourse
    const courseContent = courseInfo?.courses?.courseContent
    const {selectedChapterIndex, setSelectedChapterIndex} = useContext(SelectedChapterIndexContext);
    // console.log('Inside ChapterListSideBar: '+courseInfo);

    // let completedChapter = enrollCourse?.completedChapters ?? [];
    const completedChapter = (enrollCourse?.completedChapters ?? []).map(c => Number(c));
    console.log('Green color')
    console.log(completedChapter)
  return (
    <div className='w-full lg:w-80 xl:w-96 bg-secondary lg:h-screen p-3 sm:p-5 lg:sticky lg:top-16 overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-200'>
        <h2 className="my-3 font-bold text-lg sm:text-xl">Chapters ({courseContent?.length})</h2>
        <div className=''>
            <Accordion type="single" collapsible>
                {
                    courseContent?.map((chapter, index) => (
                        <AccordionItem value={chapter?.courseData?.chapterName} key={index}
                            onClick={()=>setSelectedChapterIndex(index)}
                        >
                        <AccordionTrigger className={`text-sm sm:text-lg font-medium my-2 p-2 rounded-lg transition-colors
                            ${completedChapter.includes(index)? 'bg-green-200': 'hover:bg-gray-100'}`}>
                            {/* <span>{!completedChapter.includes(index)? index+1: <CheckCircle className='text-green-500'/>}</span> */}
                            <span className="text-left">{index+1}. {chapter?.courseData?.chapterName}</span>
                        </AccordionTrigger>
                        <AccordionContent asChild>
                            <div className='space-y-1'>
                                {chapter.courseData.topics.map((topic, index_) => (
                                    <h2 key={index_}
                                        className={`p-2 my-1 rounded-lg text-sm transition-colors cursor-pointer hover:bg-gray-50 ${
                                            completedChapter.includes(index)
                                            ? 'bg-green-200'
                                            : 'bg-white'
                                        }`}>
                                        {topic.topic}
                                    </h2>
                                    ))}
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    ))}
            </Accordion>
        </div>
    </div>
  )
}

export default ChapterListSidebar