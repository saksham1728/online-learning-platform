import { Button } from '../../../components/ui/button';
import axios from 'axios';
import { Book, LoaderCircle, PlayCircle, Settings } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';
import React, { useState } from 'react'
import { toast } from 'sonner';

function CourseCard({course}) {
    const courseJson = course?.courseJson?.course;
    const [loading, setLoading] = useState(false);

    const onEnrollCourse =async ()=>{
        try{
            setLoading(true);
            const result = await axios.post('/api/enroll-course', {
                courseId:course?.cid
            });
            console.log(result.data);
            if(result.data.resp)
            {
                setLoading(false);
                toast.warning('Already Enrolled');
                return;
            }
            toast.success('Enrolled Successfully!')
            window.dispatchEvent(new Event('courseEnrolled'));
            setLoading(false);
        }
        catch(e){
            setLoading(false);
            toast.error('Server side error');
            console.log(e);
        }
    }

    

  return (
    <div className='shadow rounded-xl'>
        <Image src={course?.bannerImageUrl} alt={course?.name}
         height={300} width={400}
         className={'w-full h-[250px] aspect-video rounded-t-xl object-cover'}></Image>

         <div className='p-3 flex flex-col gap-3'>
            <h2 className='font-bold text-lg'>
                {courseJson?.name}
            </h2>
            <p className='line-clamp-3 text-gray-400'>{courseJson?.description}</p>
            <div className='flex justify-between items-center'>
                <h2 className='flex items-center gap-2 text-sm'><Book className='text-primary h-5 w-5'/> {courseJson?.noOfChapters} Chapters</h2>
                {course?.courseContent.length?
                <Button size={'sm'} disabled={loading} onClick={onEnrollCourse}> 
                   {loading?<LoaderCircle className='animate-spin'/>:<PlayCircle/> } Enroll Course 
                </Button>:
                <Link href={'/workspace/edit-course/' + course?.cid}> <Button size={'sm'} variant={'outline'}><Settings></Settings>Generate Course</Button></Link>}
            </div>
         </div>
    </div>
  )
}

export default CourseCard