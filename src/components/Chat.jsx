import React from 'react'

const Chat = () => {
    return (
        <div className='border-[1px] border-gray-700 max-w-6xl w-full min-h-[600px] rounded-lg'>
            {/* header */}
            <header className='flex justify-between h-20 border-b-[1px] border-gray-700'>
                <div className='p-4'>
                    <p className='text-gray-300'>signed in as name...</p>
                    <p className='text-gray-300 italic text-sm'>3 users online</p>
                </div>
                <button className='m-2 sm:mr-4'>sign out</button>
            </header>
            {/* main chat */}
            <section>
                
            </section>
            {/* message input */}
            <form className='flex flex-col sm:flex-row p-4 border-t-[1px] border-gray-700'>
                <input type="text" placeholder='Type a message...' className='p-2 w-full bg-[#000000] rounded-lg'/>
                <button className='mt-4 sm:mt-0 sm:ml-8 bg-blue-500 text-white max-h-12'>Send</button>
            </form>
        </div>
    )
}

export default Chat