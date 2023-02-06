import React from "react"
import { Routes, Route } from "react-router-dom"

import About from "../components/About"
import Extra from "../components/Extra"
import Home from "../components/Home"
import User from "../components/User"

import Authentication from "./Authentication"
import Authorization from "./Authorization"

import PERMISSIONS from "../permissions/Permissions"


function RoutePath() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<Authorization permissions={[PERMISSIONS.CAN_VIEW_ABOUT]} />}>
                <Route path="about" element={<About />} />
            </Route>
            <Route path="user" element={
                <Authentication>
                    <User />
                </Authentication>
            } />
            <Route element={<Authorization permissions={[PERMISSIONS.CAN_VIEW_EXTRA]} />}>
                <Route path="extra" element={<Extra />} />
            </Route>
        </Routes>
    )
}

export default RoutePath
