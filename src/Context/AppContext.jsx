import { createContext, useState } from "react";

export const Data = createContext();

export const DataProvider = ({ children }) => {
  const [coordinates, setCoordinates] = useState({
  latitude: 21.2514,
  longitude: 81.6296,
});



  return <Data.Provider value={{coordinates, setCoordinates}}>{children}</Data.Provider>;
};
