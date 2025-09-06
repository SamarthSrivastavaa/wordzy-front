import React from 'react'

const Footer = () => {
  return (
    <div className="w-[55%] mx-auto pb-6">
      <div className="mx-auto w-[92%] md:w-[82%] bg-white/60 backdrop-blur-sm border-2 border-pink-500 rounded-xl px-4 md:px-6 py-3 flex items-center justify-center gap-8 shadow-lg"
           style={{
             boxShadow: '4px 4px 0px rgba(239, 68, 68, 0.4)'
           }}
      >
     
        
        <div className="flex items-center gap-3">
          <span className="text-gray-700 text-sm font-medium">Made by</span>
          <a 
            href="https://x.com/SamarthS_1101" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors"
          >
            Samarth Srivastava
          </a>
        </div>

        
      </div>
    </div>
  )
}

export default Footer
