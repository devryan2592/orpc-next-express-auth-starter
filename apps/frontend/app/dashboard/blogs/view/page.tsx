import { NextPage } from "next";

interface BlogViewPageProps {
  // Add your page props here
}

const BlogViewPage: NextPage<BlogViewPageProps> = (props) => {
  return (
    <div>
      <h1>View Blogs</h1>
      <p>This is the blogs view page where all blogs will be displayed.</p>
    </div>
  );
};

export default BlogViewPage;