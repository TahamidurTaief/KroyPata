import React from "react";
import Image from "next/image";
import Link from "next/link";
import BlogComponents from "../Common/BlogComponents";

import baby_fashion from "@/public/img/Home/Caregory/baby-fashion.jpg";
import men_fashion from "@/public/img/Home/Caregory/men-fashion.jpeg";
import gadget_img from "@/public/img/Home/Caregory/gadget_img.jpg";
import girls_bag from "@/public/img/Home/Caregory/girls-bag.jpeg";
import girls_fashion from "@/public/img/Home/Caregory/girs-fashion-dress.jpeg";
import cosmatic from "@/public/img/Home/Caregory/cosmatic.jpg";

const blogs_data = [
  {
    title: "Tech Innovations in 2023",
    description: "Exploring the latest advancements in technology this year.",
    image: gadget_img,
    date: "January 15, 2023",
    slug: "tech-innovations-2023",
  },
  {
    title: "Sustainable Fashion Trends",
    description:
      "A look at eco-friendly fashion trends for the modern consumer.",
    image: baby_fashion,
    date: "February 10, 2023",
    slug: "sustainable-fashion-trends",
  },
  {
    title: "Home Automation Essentials",
    description: "Must-have gadgets for a smarter home in 2023.",
    image: men_fashion,
    date: "March 5, 2023",
    slug: "home-automation-essentials",
  },
  {
    title: "Home Automation Essentials",
    description: "Must-have gadgets for a smarter home in 2023.",
    image: girls_bag,
    date: "March 5, 2023",
    slug: "home-automation-essentials",
  },
];

const BlogSection = () => {
  return (
    <div>
      <div className="container mt-3 md:mt-5 lg:mt-8 xl:mt-10 ">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[var(--foreground)]">
            Read Our{" "}
            <span className="text-sky-500 dark:text-sky-300">Blog Post</span>
          </h2>
          <Link
            href="/categories"
            className="text-blue-500 dark:text-sky-300 underline text-md md:text-lg hover:text-blue-500 "
          >
            See All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4 py-5 lg:py-8 xl:py-10 mt-5">
          {blogs_data.map((blog, index) => (
            <BlogComponents key={index} blog_data={blog} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSection;
