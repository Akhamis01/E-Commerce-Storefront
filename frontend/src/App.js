import React, {Fragment} from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Registration from './components/Registration/Registration';
import NotFound from './components/NotFound/NotFound';
import VerificationPending from './components/Verification-Pending/Verification-Pending';
import Verification from './components/Verification/Verification';
import Contact from './components/Contact/Contact';
import AddProduct from './components/AddProduct/AddProduct';

const App = () => {
    
    return (
        <Router>
            <Fragment>
                <Routes>
                    <Route exact path="/home" element={<Home/>}/>
                    <Route exact path="/login" element={<Login/>}/>
                    <Route exact path="/registration" element={<Registration/>}/>
                    <Route exact path="/verification-pending" element={<VerificationPending/>}/>
                    <Route exact path="/verify" element={<Verification/>}/>
                    <Route exact path="/contact" element={<Contact/>}/>
                    <Route exact path="/addproduct" element={<AddProduct/>}/>
                    <Route exact path="*" element={<NotFound/>}/>
                </Routes>
            </Fragment>
        </Router>
    );

};

export default App;
