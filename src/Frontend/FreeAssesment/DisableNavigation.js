import { useEffect } from "react";

const DisableNavigation = () => {
  useEffect(() => {
    // Prevent back navigation
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
    };

    // Push initial state to the history
    window.history.pushState(null, null, window.location.pathname);

    // Add event listener to trap the back button
    window.addEventListener("popstate", handlePopState);

    return () => {
      // Cleanup the event listener on unmount
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    // Prevent page reload with a confirmation dialog
    const handleBeforeUnload = (event) => {
      const message = "If you reload, the test will end. Are you sure?";
      event.preventDefault();
      event.returnValue = message; // Required for modern browsers
      return message; // For older browsers
    };

    // Attach beforeunload event
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup the beforeunload event
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null; // This component is invisible and doesn't render anything
};

export default DisableNavigation;
