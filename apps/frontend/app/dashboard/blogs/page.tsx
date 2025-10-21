import { redirect } from "next/navigation";
import { NextPage } from "next";

interface BlogPageProps {
  // Add your page props here
}

const BlogPage: NextPage<BlogPageProps> = (props) => {
  // Redirect to the view page since /dashboard/blogs should not have content
  redirect("/dashboard/blogs/view");
};

export default BlogPage;
