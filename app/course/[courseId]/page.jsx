"use client"

import AppHeader from '../../../app/workspace/_components/AppHeader'
import React, { useEffect, useState } from 'react'
import ChapterListSidebar from '../_components/ChapterListSidebar'
import ChapterContent from '../_components/ChapterContent'
import { useParams } from 'next/navigation';
import axios from 'axios'

function Course() {
    const [courseInfo, setCourseInfo] = useState();
    const {courseId} = useParams(); 
    // console.log("Course ID:", courseId);

    useEffect(() =>{
        GetEnrolledCourseById();
    },[])


    const GetEnrolledCourseById = async () => {
        try {
            const result = await axios.get('/api/enroll-course?courseId='+courseId);
            console.log(result.data);
            setCourseInfo(result.data);
        } catch (error) {
            console.error("Failed to fetch enrolled courses:", error);
        }
    };
  return (
    <div>
        <div className="fixed w-full bg-white"></div>
            <AppHeader hideSidebar={true}/>
        <div className='flex gap-10 items-start'>
            <ChapterListSidebar courseInfo={courseInfo}/>
            <ChapterContent courseInfo={courseInfo} refreshData={()=>GetEnrolledCourseById()}/>
        </div>

    </div>
  )
}

export default Course