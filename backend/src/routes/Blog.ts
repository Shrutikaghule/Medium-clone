import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput } from "@shrutikalol/medium-common";

export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
    },
    Variables: { 
        userId :string;
    }
  }>();

blogRouter.use('/*',async (c,next)=>{
    const authHeader = c.req.header("authorization") || ""; //coz if undefined it'll pass empty string
    const user = await verify(authHeader,c.env.JWT_SECRET)
    if (user && typeof user.id === 'string'){
        c.set("userId", user.id)
        await next()
    }
    else{
        c.status(403);
        return c.json({
            message:"user is not logged in"
        })
    }
})

//create
blogRouter.post('/',async (c) => {
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if(!success){
      c.status(411)
      return c.json({
        message: "incorrect inputs zod failed"
      })
    }
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.create({
        data:{
            title:body.title,
            content:body.content,
            authorId:authorId

        }
    })
    return c.json({
        id:blog.id
    })
})


//update
blogRouter.put('/',async (c) => {
    const body = await c.req.json();
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.update({
        where:{
            id:body.id
        },
        data:{
            title:body.title,
            content:body.content

        }
    })
    return c.json({
        id:blog.id
    })
})
 

//return title of blog that exist
//todo: add pagination smtg like just show 1st 10 bolg then next button
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

      const blog = await prisma.blog.findMany();

      return c.json({
        blog
      })
})


//find
blogRouter.get('/:id', async(c) => {
    const id = c.req.param("id");
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

   try{
    const blog = await prisma.blog.update({
        where:{
            id:id
        }
    })
    return c.json({
        blog
    })
   }catch(e){
    c.status(411)
    return c.json({
        message:"error while fetching blog post"
    })
   }
})


