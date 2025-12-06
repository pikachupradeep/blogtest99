import EditPost from "@/components/post/updatePost"


interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  
  return <EditPost postId={id} />
}