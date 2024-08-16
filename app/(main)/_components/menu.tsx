"use client"
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';

interface MenuProps {
    documentId: Id<"documents">;
}

const Menu = ({ documentId }: MenuProps) => {
    const router = useRouter();
    const { user } = useUser()
    const remove = useMutation(api.documents.remove);
    const restore = useMutation(api.documents.restore);
    const archive = useMutation(api.documents.archive);

    const onArchive = () => {
        const promise = archive({ id: documentId });
        toast.promise(promise, {
            loading: "Moving to trash...",
            success: "Note moved to trash!",
            error: "Failed to archive note.",
        });
        router.push("/documents");
    }

    const onRestore = () => {
        const promise = restore({ id: documentId });
        toast.promise(promise, {
            loading: "Restoring note...",
            success: "Note restored!",
            error: "Failed to restore note.",
        });
    }

    const onRemove = () => {
        const promise = remove({ id: documentId });
        toast.promise(promise, {
            loading: "Deleting note...",
            success: "Note deleted!",
            error: "Failed to delete note.",
        });
        router.push("/documents");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className='flex items-center gap-x-2 text-muted-foreground text-sm'>
                <Button size="sm" variant="ghost">
                    <MoreHorizontal className='h-4 w-4' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-60' align='end' alignOffset={8} forceMount>
                <DropdownMenuItem onClick={onArchive}>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className='text-xs text-muted-foreground p-2'>
                    Last edited by: {user?.username}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

Menu.Skeleton = function MenuSkeleton() {
    return (
        <Skeleton className='h-10 w-10' />
    )
}

export default Menu
