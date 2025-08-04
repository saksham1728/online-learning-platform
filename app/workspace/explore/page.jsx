"use client"
import { Search } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs';
import axios from 'axios'
import { Skeleton } from '../../../components/ui/skeleton'
import CourseCard from '../_components/CourseCard'

function Explore() {

    const [courseList,setCourseList]=useState([]);
    const {user}=useUser();

    useEffect(()=>{
      user && GetCourseList()
    },[user])

    const GetCourseList=async ()=>{
      const result=await axios.get('/api/courses?courseId=0');
      console.log(result.data);
      setCourseList(result.data);
    }
  return (
    <div>
      <h2 className='font-bold text-3xl mb-6'>Explore Courses</h2>
      <div className='flex gap-5 max-w-md'>
        <Input placeholder="Search"/>
        <Button> <Search/> Search </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-5 gap-5'>
        {courseList.length>0?courseList?.map((course,index)=>(
          <CourseCard course={course} key={index}/>
        )):
        <Skeleton/>}
      </div>
    </div>
  )
}

export default Explore
