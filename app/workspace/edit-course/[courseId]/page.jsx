"use client"
import axios from 'axios';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import CourseInfo from '../_components/CourseInfo'
import ChapterTopicList from '../_components/ChapterTopicList'


function EditCourse({viewCourse=false}) {
    const {courseId}=useParams();
    const [loading,setLoading]=useState(false);
    const [course,setCourse]=useState();

    useEffect(()=>{
        GetCourseInfo();
    },[]);

    const GetCourseInfo=async()=>{
      setLoading(true);
      const result=  await axios.get('/api/courses?courseId='+courseId);
      console.log(result.data);
      setLoading(false);
      setCourse(result.data);
    }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
            <CourseInfo course={course} viewCourse={viewCourse}/>
            <ChapterTopicList course={course}/>
        </div>
    </div>
  )
}

export default EditCourse
