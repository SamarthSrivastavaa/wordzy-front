import React from 'react'

const Navbar = () => {
  return (
   <div className="w-full pt-6" >
   <div className="mx-auto w-[92%] md:w-[82%] bg-white/90 backdrop-blur-sm border-2 border-red-500 rounded-xl px-4 md:px-6 py-3 flex items-center justify-between shadow-lg"
        style={{
          boxShadow: '4px 4px 0px rgba(239, 68, 68, 0.4)'
        }}
   >
  
     <div className="flex items-center">
       <div className="font-bold edu-nsw-act-cursive rounded-md px-3 py-2 text-sm text-gray-800 tracking-wide">
         <span className='text-purple-600 text-[25px] tracking-[0.09rem]'>W</span><span className='text-gray-700 tracking-[0.09rem] text-[20px]'>ordzy</span>
       </div>
     </div>


     <div className="flex items-center gap-3">
       <button
         className="w-[160px] rounded-md border-2 border-purple-600 bg-purple-600 text-white px-4 py-1.5 text-sm font-semibold hover:bg-transparent hover:text-purple-600 transition-colors relative"
         style={{
           boxShadow: '2px 2px 0px rgba(147, 51, 234, 0.3)'
         }}
       >
         Report a Bug
       </button>
     </div>
   </div>
 </div>
  )
}

export default Navbar