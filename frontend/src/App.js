import React, { Fragment } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import NotFound from "./components/NotFound/NotFound";

const App = () => {
  return (
    <Router>
      <Fragment>
        <Routes>
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="*" element={<NotFound />} />
        </Routes>
      </Fragment>
    </Router>
  );
};

export default App;
