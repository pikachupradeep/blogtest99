import CreateProfileForm from "@/components/forms/create-profile-form";



export default function CreateProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container pt-26 pb-14 mx-auto px-4 dark:bg-gray-900">
        <CreateProfileForm />
      </div>
    </div>
  );
}