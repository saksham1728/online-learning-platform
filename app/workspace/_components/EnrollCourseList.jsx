"use client";

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import EnrollCourseCard from './EnrollCourseCard';

function EnrollCourseList() {
    const [enrolledCourseList, setEnrolledCourseList] = useState([]);

    useEffect(() => {
        GetEnrolledCourse();
        // re-fetch whenever someone enrolls
    const onEnroll = () => GetEnrolledCourse();
    window.addEventListener('courseEnrolled', onEnroll);
    return () => {
      window.removeEventListener('courseEnrolled', onEnroll);
    };
    }, []);

    const GetEnrolledCourse = async () => {
        try {
            const result = await axios.get('/api/enroll-course');
            console.log(result.data);
            setEnrolledCourseList(result.data);
        } catch (error) {
            console.error("Failed to fetch enrolled courses:", error);
        }
    };

    return enrolledCourseList?.length > 0 && (
        <div className='mt-3'>
            <h2 className='font-bold text-xl'>Continue Learning Your Courses</h2>
            <br></br>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5'>
                {enrolledCourseList.map((course, index) => (
                <EnrollCourseCard
                    course={course?.courses}
                    enrollCourse={course?.enrollCourse}
                    key={index}
                />
            ))}
            </div>
            
        </div>
    );
}

export default EnrollCourseList;