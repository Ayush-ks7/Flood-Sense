import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Main from "../Layouts/Main";
import RiskMap from "../Pages/RiskMap";
import AlertPage from "../Pages/AlertPage";
import NewzPage from "../Pages/NewzPage";
import HelplinePage from "../Pages/HelplinePage";

const AppRoutes = () => {

    const router = createBrowserRouter([
        {
            path:"/",
            element : <Main />,
            children : [
                {
                    path : "",
                    element : <RiskMap />
                },
                {
                    path : "alert",
                    element : <AlertPage />
                },
                {
                    path : "newz",
                    element : <NewzPage />
                },{
                    path : "helpline",
                    element : <HelplinePage />
                }
            ]
        }
    ])



  return <RouterProvider router={router} />;
};

export default AppRoutes;
