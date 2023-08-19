import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import Image from "next/image";

export default function Tweet(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { id } = props;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data } = api.posts.getById.useQuery({ id });
  return (
    <>
      <Head>
        <title>Simple Twitter Clone</title>
      </Head>
      <main className="mx-auto flex h-screen w-full border-x md:max-w-2xl">
        <div className="flex flex-col">
          <div className="flex w-full gap-4 p-4">
            <div className="flex flex-col">
              <Image
                src={data?.user?.image ?? "/guest-image.jpg"}
                alt="profile image"
                width={100}
                height={100}
                className="h-16 w-16 rounded-full"
              />
              <span className="mt-auto text-sm text-slate-400">
                {data?.createdAt.toLocaleString()}
              </span>
            </div>
            <div className="ml-4 flex flex-col">
              <span className="font-bold">{data?.user?.username}</span>
              <div className="max-h-36 overflow-y-hidden break-all">
                {data?.content}
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center">
            <hr className="mx-auto h-px w-[630px] border-gray-500" />
          </div>
        </div>
      </main>
    </>
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
