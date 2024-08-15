"use client"

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Error = () => {
    return (
        <div className='h-full flex flex-col items-center justify-center space-y-4'>
            <Image
                src="/fast-internet.svg"
                height="300"
                width="300"
                alt="Error"
                className='dark:hidden'
            />

            <Image
                src="/fast-internet-dark.svg"
                height="300"
                width="300"
                alt="Error"
                className='hidden dark:block'
            />
            <h2 className='text-xl font-bold'>Something went wrong!</h2>
            <Button asChild>
                <Link href="/documents">
                    Go Back
                </Link>
            </Button>
        </div>
    )
}

export default Error
