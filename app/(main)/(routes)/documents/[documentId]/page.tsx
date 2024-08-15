"use client";
import React, { useMemo } from 'react'

import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Toolbar from '@/components/toolbar';
import Cover from '@/components/cover';
import { Skeleton } from '@/components/ui/skeleton';
import Editor from '@/components/editor';
import dynamic from 'next/dynamic';

interface Props {
    params: {
        documentId: Id<"documents">;
    }
}

const DocumentIdPage = ({ params }: Props) => {
    const editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), [])
    const document = useQuery(api.documents.getById, {
        documentId: params.documentId,
    })

    const update = useMutation(api.documents.update)
    const onChange = (content: string) => {
        update({
            id: params.documentId,
            content: content
        })
    }

    if (document === undefined) {
        return (
            <>
                <Cover.Skeleton />
                <div
                    className='md:max-w-3xl lg:max-w-4xl mx-auto'>
                    <div className='space-y-4 pl-8 pt-4'>
                        <Skeleton className='h-14 w-[50%]' />
                        <Skeleton className='h-4 w-[80%]' />
                        <Skeleton className='h-4 w-[40%]' />
                        <Skeleton className='h-14 w-[60%]' />
                    </div>
                </div>
            </>
        )
    }

    if (document === null) {
        return (
            <div>
                Not Found
            </div>
        )
    }

    return (
        <div className='pb-40'>
            <Cover url={document.coverImage} />
            <div className='md:max-w-3xl lg:max-w-4xl mx-auto'>
                <Toolbar initialData={document} />
                <Editor onChange={onChange} initialContent={document.content}></Editor>
            </div>
        </div>
    )
}

export default DocumentIdPage;
