/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import { z } from "zod";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import GuestImage from "../../../../public/guest-image.jpg";
import { useState } from "react";

export default function Tweet(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data: sessionData } = useSession();
  const { id } = props;
  const { data } = api.posts.getById.useQuery({ id });
  const { mutate } = api.posts.createComment.useMutation();
  const comments = api.posts.getComments.useQuery({ postId: id }).data;
  const [comment, setComment] = useState("");
  const commentSchema = z.string().trim().min(1);
  const isCommentValid = commentSchema.safeParse(comment).success;
  return (
    <>
      <Head>
        <title>Simple Twitter Clone</title>
      </Head>
      <main className="mx-auto flex h-screen w-full border-x md:max-w-2xl">
        <div className="flex w-full flex-col">
          <div className="flex gap-4 p-4">
            <div className="flex flex-col gap-4">
              <Image
                src={data?.user?.image ?? "/guest-image.jpg"}
                alt="profile image"
                width={100}
                height={100}
                className="h-16 w-16 rounded-full"
              />
              <span className="mt-auto w-16 text-sm text-slate-400 ">
                {data?.createdAt.toLocaleString()}
              </span>
            </div>
            <div className="ml-4 flex flex-col">
              <Link href={`/${data?.user?.username}`} className="font-bold">
                @{data?.user?.username}
              </Link>
              <div className="max-h-36 overflow-y-hidden break-all text-lg">
                {data?.content}
              </div>
            </div>
          </div>
          <hr className="mx-4 border-gray-500" />
          <div className="flex border-b">
            <Authorized sessionData={sessionData} />
            {sessionData ? (
              <div className="flex w-full">
                <textarea
                  className="min-h-[120px] w-full resize-none bg-transparent p-4 outline-none"
                  placeholder="Type your Answer"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                {isCommentValid ? (
                  <button
                    className="m-4 h-fit rounded-xl bg-blue-500 px-2 text-xl"
                    onClick={() => {
                      mutate({ content: comment, postId: data?.id ?? "" });
                      setComment("");
                    }}
                  >
                    Answer
                  </button>
                ) : (
                  <button
                    className="m-4 h-fit rounded-xl bg-blue-500/50 px-2 text-xl"
                    disabled
                  >
                    Answer
                  </button>
                )}
              </div>
            ) : (
              <textarea
                className="min-h-[120px] w-full resize-none bg-transparent p-4 outline-none"
                placeholder="Sign in to post"
                disabled
              />
            )}
          </div>
          <div className="flex flex-col">
            {comments?.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4">
                {comment.content}
              </div>
            ))}
          </div>
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
        className="m-4 h-12 w-12 rounded-full"
        src={profileImage?.image ?? GuestImage}
        alt="Profile Picture"
        width={50}
        height={50}
      />
    );
  }
  return (
    <Image
      className="m-4 h-12 w-12 rounded-full"
      src={GuestImage}
      alt="Profile Picture"
      width={50}
      height={50}
    />
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const id = context.params?.id as string;
  if (typeof id !== "string") throw new Error("no id");
  await ssg.posts.getById.prefetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
