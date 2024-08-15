import React from 'react'
import Image from 'next/image'

const Heroes = () => {
    return (
        <div className='flex flex-col items-center justify-center max-w-5xl'>
            <div className='flex items-center'>
                <div className='relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px]'>
                    <Image
                        src="/planning-trip.svg"
                        fill
                        className='object-contain dark:hidden'
                        alt='Planning Trip'
                    />
                    <Image
                        src="/planning-trip-dark.svg"
                        fill
                        className='object-contain hidden dark:block'
                        alt='Planning Trip'
                    />
                </div>
                <div className='relative h-[400px] w-[400px] md:block'>
                    <Image
                        src="/fast-internet.svg"
                        fill
                        className='object-contain dark:hidden'
                        alt='Fast Internet'
                    />
                    <Image
                        src="/fast-internet-dark.svg"
                        fill
                        className='object-contain hidden dark:block'
                        alt='Fast Internet'
                    />
                </div>
            </div>
        </div>
    )
}

export default Heroes
