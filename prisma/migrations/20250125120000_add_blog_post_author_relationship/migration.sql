-- Add authorId column to blog_posts table
ALTER TABLE "blog_posts" ADD COLUMN "authorId" TEXT;

-- Add foreign key constraint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
