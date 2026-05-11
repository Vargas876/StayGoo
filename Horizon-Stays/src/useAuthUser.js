import { useState, useEffect } from "react";

export function useAuthUser() {
  const [user, setUser] = useState({
    name: "Invitado",
    role: "traveler",
    isLoggedIn: false
  });

  useEffect(() => {
    const session = localStorage.getItem("staygooSession");
    const name = localStorage.getItem("staygooUserName");
    const role = localStorage.getItem("staygooAccessRole");

    if (session === "true") {
      setUser({
        name: name || "Usuario",
        role: role || "traveler",
        isLoggedIn: true
      });
    }
  }, []);

  return user;
}
