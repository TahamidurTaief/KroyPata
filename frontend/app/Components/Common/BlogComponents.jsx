import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";

const BlogComponents = ({ blog_data }) => {
  return (
    <div>
      <div className="w-full h-full pb-5 md:pb-8 lg:pb-10 xl:pb-12">
        <div className="flex flex-col poppins justify-between gap-3 max-w-xs rounded-lg shadow-lg overflow-hidden bg-white dark:bg-[var(--color-second-bg)] p-2 md:p-3">
          <div className="w-full h-48 object-cover">
            <Image
              src={blog_data.image}
              alt=""
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">
              {blog_data.date}
            </span>
            <h2 className="text-sm md:text-md font-semibold text-[var(--color-text-primary)] truncate">
              {blog_data.title}
            </h2>
          </div>
          <div className="">
            <Link
              href={`/blog/${blog_data.slug}`}
              className="text-sm text-sky-500 hover:underline flex flex-row gap-2 items-center"
            >
              Read More <FaArrowRightLong />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogComponents;
