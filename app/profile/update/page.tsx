import UpdateProfileForm from "@/components/forms/update-profile-form";


export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-26">
      <div className="container mx-auto  px-4">
        <UpdateProfileForm />
      </div>
    </div>
  );
}