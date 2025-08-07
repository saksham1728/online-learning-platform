import { Button } from '../../../components/ui/button';
import { SelectedChapterIndexContext } from '../../../context/SelectedChapterIndexContext';
import axios from 'axios';
import { CheckCircle, Cross, Loader2Icon, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useContext, useState } from 'react'
import YouTube from 'react-youtube';
import { toast } from 'sonner';

function ChapterContent({courseInfo,refreshData}) {
  const {courseId} = useParams();
  const {courses, enrollCourse} = courseInfo ?? '';
  const courseContent = courseInfo?.courses?.courseContent
  const {selectedChapterIndex, setSelectedChapterIndex} = useContext(SelectedChapterIndexContext);
  // console.log('Cpurse Content: '+courseContent);
  const videoData = courseContent?.[selectedChapterIndex]?.youtubeVideo;
  const topics = courseContent?.[selectedChapterIndex]?.courseData?.topics;

    let completedChapter = enrollCourse?.completedChapters ?? [];

    const [loading, setLoading] = useState(false);

  const markChapterCompleted =async ()=>{
    setLoading(true);
      const newCompleted = [...completedChapter, selectedChapterIndex];
      await axios.put('/api/enroll-course', {
        courseId,
        completedChapter: newCompleted
      });

      // console.log(result);
      refreshData()
      
      toast.success('Chapter Marked Completed');
      setLoading(false);
  }

  const markInCompleteChapterCompleted =async ()=>{
    setLoading(true);
      const newCompleted = completedChapter.filter(i => i !== selectedChapterIndex);
      await axios.put('/api/enroll-course', {
        courseId,
        completedChapter: newCompleted
      });

    //   console.log(result);
      refreshData()
      
      toast.success('Chapter Marked InCompleted');
      setLoading(false);
  }

  return (
    <div className='p-3 sm:p-5 lg:p-6 max-w-full'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6'>
        <h2 className='font-bold text-lg sm:text-xl lg:text-2xl leading-tight'>
          {selectedChapterIndex+1}. {courseContent?.[selectedChapterIndex]?.courseData?.chapterName}
        </h2>
        {!completedChapter?.includes(selectedChapterIndex)?
        <Button 
          onClick={()=>markChapterCompleted()}
          disabled={loading}
          className="w-full sm:w-auto"
          size="sm"
        >
          {loading?<Loader2Icon className='animate-spin'/>:<CheckCircle/>}
          <span className="hidden sm:inline">Mark as completed</span>
          <span className="sm:hidden">Complete</span>
        </Button>:
        <Button 
          disabled={loading} 
          variant="outline" 
          onClick={markInCompleteChapterCompleted}
          className="w-full sm:w-auto"
          size="sm"
        >
          {loading?<Loader2Icon className='animate-spin'/>:<X/>} 
          <span className="hidden sm:inline">Mark Incomplete</span>
          <span className="sm:hidden">Incomplete</span>
        </Button>}
      </div>
      
      <h2 className='my-4 font-bold text-base sm:text-lg'>Related Videos 🎬</h2>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-8'>
        {videoData?.map((video,index)=> index < 2 &&(
          <div key={index} className="w-full">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <YouTube
                videoId={video?.videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                  },
                }}
                className="absolute top-0 left-0 w-full h-full"
                iframeClassName="w-full h-full rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>

      <div className='space-y-6 sm:space-y-8'>
          {topics?.map((topic, index) => (
              <div key={index} className='p-4 sm:p-5 lg:p-6 bg-secondary rounded-xl lg:rounded-2xl'>
                <h2 className='font-bold text-lg sm:text-xl lg:text-2xl text-primary mb-4'>{topic?.name}</h2>
                <div 
                  dangerouslySetInnerHTML={{ __html: topic?.content }}
                  className="prose prose-sm sm:prose lg:prose-lg max-w-none"
                  style={{
                    lineHeight:'1.8'
                  }}
                ></div>
              </div>
          ))}
      </div>

    </div>
  )
}

export default ChapterContent