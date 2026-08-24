import { useContext } from "react";
import { SkySeedContext } from "../contexts/SkySeedContext";

/** read the current sky's seed, tag, and save/destroy actions. */
const useSkySeed = () => useContext(SkySeedContext);

export { useSkySeed };
