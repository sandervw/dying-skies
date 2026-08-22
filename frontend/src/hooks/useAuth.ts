import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/** read the current user and session setter from context. */
const useAuth = () => useContext(AuthContext);

export { useAuth };
