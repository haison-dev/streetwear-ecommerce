import { useOutletContext } from "react-router-dom";

export const useStorefront = () => useOutletContext<{ openLogin: () => void }>();
