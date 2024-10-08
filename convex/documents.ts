import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const get = query({
    // args: {
    //     parentDocument: v.optional(v.id("documents")),
    // },
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const documents = await ctx.db
            .query("documents")
            .collect()
            // .withIndex("by_user", q => q.eq("userId", identity.subject))
            // .filter(q => q.eq(q.field("parentDocument"), args.parentDocument))
            // .collect();
        return documents;
    }
})


export const getSidebar = query({
    args: {
        parentDocument: v.optional(v.id("documents")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user_parent", q => q.eq("userId", userId).eq("parentDocument", args.parentDocument))
            .filter(q => q.eq(q.field("isArchived"), false))
            .order("desc")
            .collect();
        return documents;
    }
})

export const archive = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const { id } = args;
        const document = await ctx.db.get(id) as Doc<"documents">;
        if (!document) {
            throw new Error("Not found");
        }
        if (document.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }
        const recursiveArchive = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", q => q.eq("userId", identity.subject).eq("parentDocument", documentId))
                .filter(q => q.eq(q.field("isArchived"), false))
                .collect();
            for (const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: true,
                });
                await recursiveArchive(child._id);
            }
        }
        const updated = await ctx.db.patch(id, {
            isArchived: true,
        });
        await recursiveArchive(id);
        return updated;
    }
})

export const create = mutation({
    args: {
        title: v.string(),
        parentDocument: v.optional(v.id("documents")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchived: false,
            isPublished: false,
        });
        return document;
    }
})

export const getTrash = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user", q => q.eq("userId", userId))
            .filter(q => q.eq(q.field("isArchived"), true))
            .order("desc")
            .collect();
        return documents;
    }
})

export const restore = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const { id } = args;
        const document = await ctx.db.get(id) as Doc<"documents">;
        if (!document) {
            throw new Error("Not found");
        }
        if (document.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        const recursiveRestore = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", q => q.eq("userId", identity.subject).eq("parentDocument", documentId))
                .filter(q => q.eq(q.field("isArchived"), true))
                .collect();
            for (const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: false,
                });
                await recursiveRestore(child._id);
            }
        }

        const options: Partial<Doc<"documents">> = {
            isArchived: false,
        };

        if (document.parentDocument) {
            const parentDocument = await ctx.db.get(document.parentDocument);
            if (parentDocument?.isArchived) {
                options.parentDocument = undefined;
            }
        }

        const updated = await ctx.db.patch(id, options);
        await recursiveRestore(id);
        return updated;
    }
})

export const remove = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const { id } = args;
        const document = await ctx.db.get(id) as Doc<"documents">;
        if (!document) {
            throw new Error("Not found");
        }
        if (document.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }
        const recursiveRemove = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", q => q.eq("userId", identity.subject).eq("parentDocument", documentId))
                .collect();
            for (const child of children) {
                await recursiveRemove(child._id);
                await ctx.db.delete(child._id);
            }
        }
        await ctx.db.delete(id);
        await recursiveRemove(id);
        return document;
    }
})

export const getSearch =  query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user", q => q.eq("userId", userId))
            .filter(q => q.eq(q.field("isArchived"), false))
            .order("desc")
            .collect();
        return documents;
    }
})

export const getById = query({
    args: {
        documentId: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const { documentId } = args;
        const document = await ctx.db.get(documentId);
        if (!document) {
            throw new Error("Not found");
        }
        if (document.isPublished && !document.isArchived) {
            return document;
        }
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        if (document.userId !== userId) {
            throw new Error("Not authorized");
        }
        return document;
    }
})

export const getPublishedById = query({
    args: {
        documentId: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const { documentId } = args;
        const document = await ctx.db.get(documentId);
        if (!document || !document.isPublished) {
            throw new Error("Not found");
        }
        return document;
    }
})

export const update = mutation({
    args: {
        id: v.id("documents"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const { id, ...data } = args;
        const document = await ctx.db.get(id);
        if (!document) {
            throw new Error("Not found");
        }
        if (document.userId !== identity.subject) {
            throw new Error("Not authorized");
        }
        const updated = await ctx.db.patch(id, data);
        return updated;
    }
})

export const removeIcon = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const { id } = args;
        const document = await ctx.db.get(id);
        if (!document) {
            throw new Error("Not found");
        }
        if (document.userId !== identity.subject) {
            throw new Error("Not authorized");
        }
        const updated = await ctx.db.patch(id, {
            icon: undefined,
        });
        return updated;
    }
})

export const removeCoverImage = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const { id } = args;
        const document = await ctx.db.get(id);
        if (!document) {
            throw new Error("Not found");
        }
        if (document.userId !== identity.subject) {
            throw new Error("Not authorized");
        }
        const updated = await ctx.db.patch(id, {
            coverImage: undefined,
        });
        return updated;
    }
})

