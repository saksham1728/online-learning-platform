import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'
import CourseList from './_components/CourseList'
import EnrollCourseList from './_components/EnrollCourseList'

function Workspace() {
  return (
    <div>
      <WelcomeBanner/>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <EnrollCourseList/>
      </div>
      <CourseList/>
    </div>
  )
}

export default Workspace
