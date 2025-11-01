import AuthorsTable from "@/components/author-networks/authors-table";
import NetworkStatistics from "@/components/author-networks/network-statistics";
import SearchAuthorsForm from "@/components/author-networks/search-authors-form";
import SocialNetwork from "@/components/author-networks/social-network";

const AuthorNetworksPage = () => {
  return (
    <main className="space-y-4 p-6 min-h-full">
      <h1 className="font-semibold text-2xl">Author Networks</h1>
      <section className="gap-4 grid grid-cols-6 min-h-[700px]">
        <div className="col-span-4">
          <SocialNetwork />
        </div>
        <div className="col-span-2">
          <NetworkStatistics />
        </div>
      </section>
      <SearchAuthorsForm />
      <AuthorsTable />
    </main>
  );
};

export default AuthorNetworksPage;
