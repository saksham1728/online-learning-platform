import { Book, Clock, Loader2Icon, PlayCircle, Settings, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react'
import { Button } from '../../../../components/ui/button';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

function CourseInfo({course,viewCourse}) {
  const courseLayout=course?.courseJson?.course;
  const [loading,setLoading]=useState(false);
  const router=useRouter();
  
  const GenerateCourseContent=async ()=>{
    //Call API to Generate content
    setLoading(true);
    try{
    const result=await axios.post('/api/generate-course-content',{
        courseJson:courseLayout,
        courseTitle:course?.name,
        courseId:course?.cid
    });
    console.log(result.data);
    setLoading(false);
    router.replace('/workspace');
    toast.success('Course Generated Successfully');
}
catch(e){
    setLoading(false);
    console.log(e);
    toast.error('Course Generation failed! Try Again');
}

  }

  return (
    <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg bg-white'>
        <div className='flex flex-col gap-4 flex-1'>
            <h2 className='font-bold text-xl sm:text-2xl lg:text-3xl leading-tight'>{courseLayout?.name}</h2>
            <p className='line-clamp-3 text-gray-600 text-sm sm:text-base'>{courseLayout?.description}</p>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                <div className='flex gap-3 sm:gap-4 items-center p-3 sm:p-4 rounded-lg shadow-sm bg-blue-50 border border-blue-100'>
                    <Clock className='text-blue-500 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0'/>
                    <section>
                        <h2 className='font-bold text-sm sm:text-base'>Duration</h2>
                        <h2 className='text-xs sm:text-sm text-gray-600'>{courseLayout?.totalDuration}</h2>
                    </section>
                </div>
                <div className='flex gap-3 sm:gap-4 items-center p-3 sm:p-4 rounded-lg shadow-sm bg-green-50 border border-green-100'>
                    <Book className='text-green-500 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0' />
                    <section>
                        <h2 className='font-bold text-sm sm:text-base'>Chapters</h2>
                        <h2 className='text-xs sm:text-sm text-gray-600'>{courseLayout?.noOfChapters}</h2>
                    </section>
                </div>
                <div className='flex gap-3 sm:gap-4 items-center p-3 sm:p-4 rounded-lg shadow-sm bg-red-50 border border-red-100 sm:col-span-2 lg:col-span-1'>
                    <TrendingUp className='text-red-500 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0'/>
                    <section>
                        <h2 className='font-bold text-sm sm:text-base'>Difficulty level</h2>
                        <h2 className='text-xs sm:text-sm text-gray-600'>{course?.level}</h2>
                    </section>
                </div>
            </div>
           {!viewCourse ? 
            <Button 
                className='w-full sm:w-auto sm:max-w-sm mt-2' 
                disabled={loading} 
                onClick={GenerateCourseContent}
                size="lg"
            >    
                {loading ? <Loader2Icon className='animate-spin'/>:<Settings/>} 
                <span className="ml-2">Generate Content</span>
            </Button> :
            <Link href={'/course/'+course?.cid}>
                <Button className="w-full sm:w-auto" size="lg">
                    <PlayCircle className="mr-2"/>
                    Continue Learning
                </Button>
            </Link>
           }
        </div>
        <div className="flex-shrink-0 lg:w-80 xl:w-96">
            <Image 
                src={course?.bannerImageUrl} 
                alt={'Course Banner Image'}
                width={400}
                height={240}
                className='w-full h-48 sm:h-56 lg:h-64 object-cover rounded-xl lg:rounded-2xl shadow-md'
            />
        </div>
    </div>
  )
}

export default CourseInfo
