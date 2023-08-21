import { signIn, signOut, useSession } from "next-auth/react";
import { type Session } from "next-auth";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { useState } from "react";
import Image from "next/image";
import GuestImage from "../../public/guest-image.jpg";

export default function Home() {
  const { data: sessionData } = useSession();
  const [content, setContent] = useState("");
  const { mutate } = api.posts.createPost.useMutation();
  const posts = api.posts.getAllPosts.useQuery().data;
  return (
    <>
      <Head>
        <title>Simple Twitter Clone</title>
      </Head>
      <main className="mx-auto flex h-screen w-full border-x md:max-w-2xl">
        <div className="flex w-full flex-col overflow-x-hidden overflow-y-scroll">
          <div className="border-b">
            <div className="mb-4 flex">
              <Authorized sessionData={sessionData} />
              {sessionData ? (
                <textarea
                  className="min-h-[120px] w-full resize-none bg-transparent p-4 outline-none"
                  placeholder="Type a new Tweet"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              ) : (
                <textarea
                  className="min-h-[120px] w-full resize-none bg-transparent p-4 outline-none"
                  placeholder="Sign in to post"
                  disabled
                />
              )}
            </div>
            <hr className="mx-4 border-gray-500" />
            <div className="flex justify-end">
              <button
                className="m-4 w-1/6 rounded-xl bg-blue-500 px-2 text-xl"
                onClick={() => {
                  mutate({ content });
                  setContent("");
                }}
              >
                Post
              </button>
              {sessionData ? (
                <button
                  className="m-4 w-1/6 rounded-xl bg-blue-500 px-2 text-xl"
                  onClick={() => void signOut()}
                >
                  Sign out
                </button>
              ) : (
                <button
                  className="m-4 w-1/6 rounded-xl bg-blue-500 px-2 text-xl"
                  onClick={() => void signIn()}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
          {posts?.map((post) => (
            <Link
              key={post.id}
              className="flex w-full items-center border-b p-4"
              href={`/${post.user?.username}/status/${post.id}`}
            >
              <div className="flex gap-4">
                <div className="flex flex-col gap-4">
                  <Image
                    src={post?.user?.image ?? "/guest-image.jpg"}
                    alt="profile image"
                    width={100}
                    height={100}
                    className="h-16 w-16 rounded-full"
                  />
                  <span className="mt-auto w-16 text-sm text-slate-400 ">
                    {post?.createdAt.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">@{post.user?.username}</span>
                  <div className="max-h-36 overflow-y-hidden break-all">
                    {post.content}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

function Authorized({ sessionData }: { sessionData: Session | null }) {
  if (sessionData) {
    const profileImage = api.posts.getCurrentImage.useQuery().data;
    return (
      <Image
        className="m-4 h-16 w-16 rounded-full"
        src={profileImage?.image ?? GuestImage}
        alt="Profile Picture"
        width={50}
        height={50}
      />
    );
  }
  return (
    <Image
      className="m-4 h-16 w-16 rounded-full"
      src={GuestImage}
      alt="Profile Picture"
      width={50}
      height={50}
    />
  );
}
