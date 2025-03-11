"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function LoginGoogle() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Get error message added by next/auth in URL.
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  useEffect(() => {
    const errorMessage = Array.isArray(error) ? error.pop() : error;
    errorMessage && toast.error(errorMessage);
    console.log(errorMessage);
  }, [error]);

  return (
    <button
      disabled={loadingGoogle}
      onClick={() => {
        setLoadingGoogle(true);
        signIn("google", { callbackUrl });
      }}
      className={`${
        loadingGoogle
          ? "cursor-not-allowed bg-stone-50 dark:bg-stone-800"
          : "bg-white hover:bg-stone-50 active:bg-stone-100 dark:bg-black dark:hover:border-white dark:hover:bg-black"
      } group my-2 flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-stone-200 transition-colors duration-75 focus:outline-none dark:border-stone-700`}
    >
      {loadingGoogle ? (
        "Loading..."
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-black dark:text-white"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
            Login with Google
          </p>
        </>
      )}
    </button>
  );
}
