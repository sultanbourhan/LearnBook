import React from 'react'
import './Loading_Chat.css'
const Loading_Chat = () => {
  return (
    <div className='flex_lod_Chat'>
     <div className="loader">
      <div className="wrapper">
        <div className='user_lod'>
          <div className='user_lo'>
            <div className="circle"></div>
            <div className="user_name_lo"></div>
          </div>
          <div className='exit'></div>
        </div>
        <div className='line-4S'>
          <div className="line-4"></div>
          <div className="line-4"></div>
          <div className="line-4"></div>
          <div className="line-4"></div>
        </div>
        
      </div>
     </div>
    </div>
   
  )
}

export default Loading_Chat