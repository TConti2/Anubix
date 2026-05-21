import { getProviders, signIn } from "next-auth/react";

export default function SignIn({ providers }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Sign In
        </h1>
        {providers ? (
          Object.values(providers).map((provider) => (
            <div key={provider.name} className="mb-4">
              <button
                onClick={() =>
                  signIn(provider.id, { callbackUrl: "/dashboard" })
                }
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition duration-200"
              >
                Sign in with {provider.name}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Loading providers...</p>
        )}
      </div>
    </div>
  );
}
export async function getServerSideProps() {
  const providers = await getProviders();
  console.log("Loaded Providers:", providers); // <- Drop it here

  return {
    props: { providers },
  };
}
