"use client";

export default function LogoutForm() {
  // Reset Pendo to a fresh anonymous visitor so the next user is not tracked
  // under this user's identity. clearSession is not part of the install
  // snippet's queue stub, so only call it once the agent has loaded.
  const clearPendoSession = () => {
    if (
      typeof pendo !== "undefined" &&
      typeof pendo.clearSession === "function"
    ) {
      pendo.clearSession();
    }
  };

  return (
    <form action="/auth/logout" method="post" onSubmit={clearPendoSession}>
      <button type="submit">Logout</button>
    </form>
  );
}
