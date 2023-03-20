import Link from "next/link";
import React from "react";

export default function ProfileScreen() {
  return (
    <div className="w-full h-screen flex flex-auto flex-col gap-4 justify-center items-center">
      <h2 className="text-2xl font-calistoga">Profile Page</h2>
      <p>Your Name: username</p>
      <Link href={`/channels/T415kos6wzfgjKDBpWe3`} className="hover:underline">
        Return to Chat Room
      </Link>
    </div>
  );
}
