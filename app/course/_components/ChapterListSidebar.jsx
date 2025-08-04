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
    <div className='w-200 bg-secondary h-screen p-5 sticky top-0 overflow-y-auto'>
        <h2 className="my-3 font-bold text-xl">Chapters ({courseContent?.length})</h2>
        <div className=''>
            <Accordion type="single" collapsible>
                {
                    courseContent?.map((chapter, index) => (
                        <AccordionItem value={chapter?.courseData?.chapterName} key={index}
                            onClick={()=>setSelectedChapterIndex(index)}
                        >
                        <AccordionTrigger className={`text-lg font-medium my-2 p-2
                            ${completedChapter.includes(index)? 'bg-green-200': ''}`}>
                            {/* <span>{!completedChapter.includes(index)? index+1: <CheckCircle className='text-green-500'/>}</span> */}
                            {index+1}.{chapter?.courseData?.chapterName}
                        </AccordionTrigger>
                        <AccordionContent asChild>
                            <div className=''>
                                {chapter.courseData.topics.map((topic, index_) => (
                                    <h2 key={index_}
                                        className={`p-2 my-1 rounded-lg ${
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