export default {
    providers: [
        {
        domain: process.env.NEXT_PUBLIC_CONVEXT_AUTH_DOMAIN!,
        applicationID: "convex",
        },
    ]
};