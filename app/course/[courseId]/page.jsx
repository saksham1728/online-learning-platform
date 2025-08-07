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
    <div className="min-h-screen bg-gray-50">
        <div className="fixed w-full bg-white z-10 shadow-sm">
            <AppHeader hideSidebar={true}/>
        </div>
        <div className='flex flex-col lg:flex-row gap-0 lg:gap-6 pt-16'>
            <div className="lg:w-80 xl:w-96">
                <ChapterListSidebar courseInfo={courseInfo}/>
            </div>
            <div className="flex-1 min-w-0">
                <ChapterContent courseInfo={courseInfo} refreshData={()=>GetEnrolledCourseById()}/>
            </div>
        </div>
    </div>
  )
}

export default Course