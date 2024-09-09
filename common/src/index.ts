import z from "zod";

export const signupInput = z.object ({
    username : z.string().email(),
    password: z.string().min(4),
    name: z.string().optional()
})

//type inferance in zod
export type signupInput = z.infer<typeof signupInput>


export const signinInput = z.object ({
    username : z.string().email(),
    password: z.string().min(4)
})

//type inferance in zod
export type signinInput = z.infer<typeof signinInput>


export const createBlogInput = z.object ({
    title : z.string(),
    content: z.string(),
    id: z.number()
})

//type inferance in zod
export type createBlogInput = z.infer<typeof createBlogInput>