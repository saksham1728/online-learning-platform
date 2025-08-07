import { Gift } from 'lucide-react';
import React from 'react'

function ChapterTopicList({course}) {
    const courseLayout=course?.courseJson?.course;
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h2 className='font-bold text-2xl sm:text-3xl mt-8 sm:mt-10 text-center'>Chapters and Topics</h2>
      <div className='flex flex-col items-center justify-center mt-8 sm:mt-10 max-w-4xl mx-auto'>

    {courseLayout?.chapters.map((chapter, index) => (

        <div key={index} className='flex flex-col items-center w-full'>

            <div className='p-4 sm:p-6 border shadow-lg rounded-xl bg-primary text-white max-w-md w-full mx-4'>

                <h2 className='text-center text-sm sm:text-base'>Chapter {index + 1}</h2>

                <h2 className='font-bold text-base sm:text-lg lg:text-xl text-center mt-2 leading-tight'>{chapter.chapterName}</h2>

                <div className='text-xs sm:text-sm flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 mt-3'>
                    <span>Duration: {chapter?.duration}</span>
                    <span>Topics: {chapter?.topics?.length}</span>
                </div>

            </div>

            <div className="w-full max-w-2xl">

                {chapter?.topics.map((topic, index) => (

                    <div className='flex flex-col items-center' key={index}>

                        <div className='h-6 sm:h-10 bg-gray-300 w-1'></div>

                        <div className='flex items-center gap-3 sm:gap-5 w-full px-4'>

                            <span className={`${index % 2 == 0 && 'text-transparent'} max-w-xs text-xs sm:text-sm text-center flex-1`}>{topic}</span>

                            <div className='text-center rounded-full bg-gray-300 text-gray-600 p-3 sm:p-4 font-semibold text-sm sm:text-base min-w-[2.5rem] sm:min-w-[3rem]'>{index + 1}</div>

                            <span className={`${index % 2 != 0 && 'text-transparent'} max-w-xs text-xs sm:text-sm text-center flex-1`}>{topic}</span>

                        </div>

                        {index == chapter?.topics?.length - 1 && <div className='h-6 sm:h-10 bg-gray-300 w-1'></div>}

                        {index == chapter?.topics?.length - 1 && <div className='flex items-center gap-5'>

                            <Gift className='text-center rounded-full bg-gray-300 h-12 w-12 sm:h-14 sm:w-14 text-gray-500 p-3 sm:p-4' />

                        </div>

                        }

                        {index == chapter?.topics?.length - 1 && <div className='h-6 sm:h-10 bg-gray-300 w-1'></div>}



                    </div>

                ))}

            </div>

        </div>

    ))}

    <div className='p-4 sm:p-6 border shadow-lg rounded-xl bg-green-600 text-white max-w-md w-full mx-4'>

        <h2 className="text-center font-bold text-base sm:text-lg">🎉 Course Complete!</h2>

    </div>

</div>


    </div>
  )
}

export default ChapterTopicList
